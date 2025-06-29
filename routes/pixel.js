
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const { redis } = require('../services/redisService');
const sentiumService = require('../services/sentiumService');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

router.post('/pixel', apiLimiter, async (req, res) => {
  try {
    const { action, pixelState } = req.body;
    console.log(`Pixel API request: ${action}`, pixelState ? 'with state data' : 'without state data');
    if (action === 'connect') {
      res.json({
        success: true,
        version: sentiumService.getVersion(),
        message: 'Connected to local Sentium server',
        serverTime: Date.now(),
        serverType: 'local'
      });
    } else if (action === 'saveState' && pixelState) {
      const key = 'pixel:state';
      try {
        if (redis) {
          await redis.hmset(key, pixelState);
          console.log('Pixel state saved to Redis:', pixelState);
        } else {
          fs.writeFileSync(
            path.join(sentiumService.SENTIUM_PRIMARY_PATH, 'pixel-state.json'), 
            JSON.stringify(pixelState), 
            'utf8'
          );
          console.log('Pixel state saved to file:', pixelState);
        }
        res.json({ success: true, message: 'Pixel state saved' });
      } catch (error) {
        console.error('Error saving pixel state:', error);
        res.status(500).json({ error: 'Failed to save pixel state' });
      }
    } else {
      res.status(400).json({ error: 'Invalid action for pixel API' });
    }
  } catch (error) {
    console.error('Error in pixel API:', error);
    res.status(500).json({ error: 'Server error processing pixel request' });
  }
});

router.get('/pixel', apiLimiter, async (req, res) => {
  const origin = req.headers.origin || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  console.log(`🟢 GET /api/pixel request received from ${origin}`);
  console.log(`📱 User Agent: ${userAgent}`);
  res.json({
    success: true,
    version: sentiumService.getVersion(),
    message: 'Connected to local Sentium server',
    serverTime: Date.now(),
    serverType: 'local',
    note: 'For full functionality, use POST requests',
    connectionInfo: {
      clientOrigin: origin,
      serverAddress: req.socket.localAddress,
      serverPort: req.socket.localPort,
      requestedUrl: req.originalUrl,
      corsEnabled: true,
      userAgent: userAgent,
      protocolVersion: req.httpVersion
    }
  });
});

router.get('/test-connection', async (req, res) => {
  const origin = req.headers.origin || 'unknown';
  console.log(`🔵 Connection test from ${origin}`);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Private-Network', 'true');
  const userAgent = req.headers['user-agent'] || 'unknown';
  const referer = req.headers['referer'] || 'unknown';
  const acceptHeader = req.headers['accept'] || 'unknown';
  console.log(`🔎 Test connection details - Referer: ${referer}, UA: ${userAgent.substring(0, 50)}...`);
  res.json({
    success: true,
    message: 'Connection to Sentium server successful',
    serverType: 'local',
    version: sentiumService.getVersion(),
    serverTime: Date.now(),
    origin: origin,
    requestDetails: {
      userAgent: userAgent,
      referer: referer,
      acceptHeader: acceptHeader,
      ip: req.ip,
      path: req.path,
      hostname: req.hostname
    }
  });
});

router.get('/jsonp-test', (req, res) => {
  const callback = req.query.callback || 'sentiumCallback';
  const origin = req.headers.origin || 'unknown';
  console.log(`🔷 JSONP connection test from ${origin}`);
  const responseData = {
    success: true,
    message: 'Connection to Sentium server successful via JSONP',
    serverType: 'local',
    version: sentiumService.getVersion(),
    serverTime: Date.now(),
    origin: origin
  };
  res.set('Content-Type', 'application/javascript');
  res.send(`${callback}(${JSON.stringify(responseData)})`);
});

module.exports = router;
