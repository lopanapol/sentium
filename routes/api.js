
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const sentiumService = require('../services/sentiumService');
const { redis } = require('../services/redisService');
const pixelConsciousness = require('../system/pixel/pixel-consciousness');
const chatRoutes = require('./chat');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

router.get('/status', (req, res) => {
  res.json({
    status: 'ok',
    version: sentiumService.getVersion(),
    timestamp: new Date().toISOString()
  });
});

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    version: sentiumService.getVersion(),
    timestamp: new Date().toISOString(),
    endpoints: ['/api/status', '/api/sentium']
  });
});

router.post('/', apiLimiter, (req, res) => {
  const action = req.query.action || req.body.action;
  console.log('API request received: %s', action, req.query, req.body);
  if (action === 'VERSION') {
    res.json({ version: sentiumService.getVersion() });
  } else if (action === 'STORE') {
    const key = req.query.key || req.body.key;
    const value = req.query.value || req.body.value;
    sentiumService.handleSentiumAction('STORE', { key, value });
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid action' });
  }
});

router.post('/sentium', apiLimiter, async (req, res) => {
  try {
    const { action } = req.body;
    if (action === 'getVersion') {
      const sentiumConnected = await sentiumService.checkSentiumSystem();
      let version = '1.0';
      if (sentiumConnected) {
        try {
          const sentiumResponse = await sentiumService.handleSentiumAction('VERSION');
          if (sentiumResponse && sentiumResponse.version) {
            version = sentiumResponse.version;
          }
        } catch (error) {
          console.warn('Could not get version from Sentium system:', error.message);
        }
      }
      await redis.hset('pixel:state', 'connected', String(sentiumConnected));
      await redis.hset('pixel:state', 'lastConnected', new Date().toISOString());
      let consciousnessModel = 'None';
      let consciousnessLevel = 0;
      if (sentiumConnected) {
        try {
          consciousnessModel = await pixelConsciousness.getCurrentConsciousnessModel(sentiumService.SENTIUM_PRIMARY_PATH);
          consciousnessLevel = await pixelConsciousness.getConsciousnessLevel(sentiumService.SENTIUM_PRIMARY_PATH);
        } catch (error) {
          console.warn('Could not get consciousness information:', error.message);
        }
      }
      res.json({
        version,
        connected: sentiumConnected,
        consciousnessModel,
        consciousnessLevel,
        timestamp: new Date().toISOString()
      });
    } else if (action === 'getState') {
      const state = await redis.hgetall('pixel:state');
      if (state && state.connected === 'true') {
        try {
          state.consciousnessModel = await pixelConsciousness.getCurrentConsciousnessModel(sentiumService.SENTIUM_PRIMARY_PATH);
          state.consciousnessLevel = await pixelConsciousness.getConsciousnessLevel(sentiumService.SENTIUM_PRIMARY_PATH);
          state.consciousnessModelDescription = pixelConsciousness.CONSCIOUSNESS_MODELS[state.consciousnessModel] || 'Unknown';
        } catch (error) {
          console.warn('Could not add consciousness information to state:', error.message);
        }
      }
      res.json(state);
    } else if (action === 'updateState') {
      const { state } = req.body;
      if (state) {
        await redis.hmset('pixel:state', state);
        const sentiumConnected = await redis.hget('pixel:state', 'connected');
        if (sentiumConnected === 'true') {
          try {
            await sentiumService.handleSentiumAction('STORE', { 
              key: 'pixel:state', 
              value: state 
            });
          } catch (error) {
            console.warn('Failed to store state to Sentium:', error.message);
          }
        }
        res.json({ success: true });
      } else {
        res.status(400).json({ error: 'No state provided' });
      }
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.use('/', chatRoutes);

module.exports = router;
