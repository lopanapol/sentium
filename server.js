const express = require('express');
const path = require('path');
const pixelConsciousness = require('./system/pixel/pixel-consciousness');
const { initializePixelState, redis } = require('./services/redisService');
const sentiumService = require('./services/sentiumService');
const apiRoutes = require('./routes/api');
const pixelRoutes = require('./routes/pixel');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

app.use((req, res, next) => {
  let pathsConfig;
  try {
    pathsConfig = require('./config/paths');
  } catch (error) {
    pathsConfig = { ALLOW_CROSS_ORIGIN: false, ALLOWED_ORIGINS: [] };
  }
  const allowCrossOrigin = pathsConfig.ALLOW_CROSS_ORIGIN || false;
  const allowedOrigins = pathsConfig.ALLOWED_ORIGINS || [];
  const apiEndpoints = ['/api/pixel', '/api/test-connection', '/api/status'];
  const isApiRequest = apiEndpoints.includes(req.path);
  const isDebugMode = req.query.debug === 'true';

  if (req.headers.origin) {
    const origin = req.headers.origin;
    const isGitHubPages = origin.includes('github.io');
    const isSentiumDev = origin.includes('sentium.dev');

    if (isApiRequest && (isGitHubPages || isSentiumDev)) {
      console.log(`☑️ Allowing ${isGitHubPages ? 'GitHub Pages' : 'sentium.dev'} request from: ${origin}`);
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Private-Network', 'true');
    } else if (allowCrossOrigin) {
      if (allowedOrigins.includes(origin)) {
        console.log(`☑️ Allowing request from allowed origin: ${origin}`);
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
      } else if (isDebugMode) {
        console.log(`⚠️ Allowing request from non-allowed origin in debug mode: ${origin}`);
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      } else {
        console.log(`⚠️ Blocked request from unallowed origin: ${origin}`);
      }
    }
  }

  console.log(`${req.method} ${req.path} from ${req.headers.origin || 'unknown origin'}`);

  if (req.method === 'OPTIONS') {
    if (req.headers.origin) {
      const origin = req.headers.origin;
      const isGitHubPages = origin.includes('github.io');
      const isSentiumDev = origin.includes('sentium.dev');
      if (isApiRequest && (isGitHubPages || isSentiumDev)) {
        res.header('Access-Control-Allow-Private-Network', 'true');
      }
    }
    return res.sendStatus(200);
  }

  next();
});

app.use('/api', apiRoutes);
app.use('/api', pixelRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Sentium consolidated server running on port ${PORT}`);
  await initializePixelState();

  console.log('Checking Sentium system connection...');
  const connected = await sentiumService.checkSentiumSystem();

  if (connected) {
    console.log('Initializing conscious pixel integration...');
    const consciousnessInitialized = await pixelConsciousness.initializePixelConsciousness(
      sentiumService.SENTIUM_PRIMARY_PATH,
      redis
    );

    if (consciousnessInitialized) {
      console.log('✅ Conscious pixel activated with advanced consciousness model');
    } else {
      console.log('⚠️ Basic conscious pixel active (limited consciousness features)');
    }
  }

  if (connected) {
    console.log(`✅ Successfully connected to Sentium system at ${sentiumService.SENTIUM_PRIMARY_PATH}`);
    console.log(`✅ Version: ${sentiumService.getVersion()}`);
  } else {
    console.log(`
❌ ERROR: Could not connect to Sentium system at ${sentiumService.SENTIUM_PRIMARY_PATH}`);
    console.log('\nThe Sentium web interface requires the Sentium system to be installed.');
    console.log('Please make sure that:');
    console.log(`  1. The Sentium repository is installed at ${sentiumService.SENTIUM_PRIMARY_PATH}`);
    console.log('  2. Proper permissions are set for the directory');
    console.log('\nTo install Sentium:');
    console.log('  sudo mkdir -p /opt');
    console.log('  cd /opt');
    console.log('  sudo git clone https://github.com/void-sign/sentium.git\n');
    console.log('The web interface will run in disconnected mode until Sentium is installed.');
  }
});