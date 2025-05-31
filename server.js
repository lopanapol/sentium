// Server component for Sentium Web - consolidated API & Web server
const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const sanitizeFilename = require('sanitize-filename');
const { spawn } = require('child_process');
const fs = require('fs');

// Load pixel consciousness system
const pixelConsciousness = require('./system/pixel/pixel-consciousness');

// Load paths configuration
let pathsConfig;
try {
  // Try to load the actual paths.js file (which should be gitignored)
  pathsConfig = require('./config/paths');
} catch (error) {
  console.log('⚠️ Custom paths.js not found, using default paths');
  // Fallback to default paths if the config file doesn't exist
  pathsConfig = {
    SENTIUM_PRIMARY_PATH: '/opt/sentium',
    SENTIUM_FALLBACK_PATH: '/opt/sentium'
  };
}

// Get Sentium paths from environment variables or config file
const SENTIUM_PRIMARY_PATH = process.env.SENTIUM_PATH || pathsConfig.SENTIUM_PRIMARY_PATH;
const SENTIUM_FALLBACK_PATH = process.env.SENTIUM_FALLBACK_PATH || pathsConfig.SENTIUM_FALLBACK_PATH;

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Redis client is optional - will use if available
let redis;
try {
  const Redis = require('ioredis');
  redis = new Redis();
  console.log('✅ Redis client initialized');
} catch (error) {
  console.log('⚠️ Redis not available, will use file-based storage');
  redis = {
    exists: async () => false,
    hmset: async () => true,
    hgetall: async () => ({}),
    hset: async () => true,
    hget: async () => null
  };
}

// Execute an HTTPie command and return the result
function executeHttpie(args) {
  return new Promise((resolve, reject) => {
    const http = spawn('http', args);
    let stdout = '';
    let stderr = '';

    http.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    http.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    http.on('close', (code) => {
      if (code === 0) {
        try {
          const result = stdout ? JSON.parse(stdout) : {};
          resolve(result);
        } catch (error) {
          resolve(stdout);
        }
      } else {
        reject(new Error(`HTTPie command failed with exit code ${code}: ${stderr}`));
      }
    });
  });
}

// Get Sentium version
function getVersion() {
  try {
    // Check both possible paths for VERSION file
    if (fs.existsSync(`${SENTIUM_PRIMARY_PATH}/VERSION`)) {
      return fs.readFileSync(`${SENTIUM_PRIMARY_PATH}/VERSION`, 'utf8').trim();
    }
    if (fs.existsSync(`${SENTIUM_FALLBACK_PATH}/VERSION`)) {
      return fs.readFileSync(`${SENTIUM_FALLBACK_PATH}/VERSION`, 'utf8').trim();
    }
    return '1.0';
  } catch (error) {
    console.error('Error reading version:', error);
    return '1.0';
  }
}

// Check connection to Sentium system
function checkSentiumSystem() {
  return new Promise(async (resolve) => {
    try {
      // Define the possible paths where Sentium might be installed
      const possiblePaths = [
        SENTIUM_PRIMARY_PATH,
        SENTIUM_FALLBACK_PATH
      ];
      
      // Try direct file access to VERSION file in each path
      for (const basePath of possiblePaths) {
        if (fs.existsSync(`${basePath}/VERSION`)) {
          console.log(`Successfully connected to Sentium system via file system at ${basePath}`);
          resolve(true);
          return;
        }
      }

      // Try a basic file system check with ls on each path
      for (const basePath of possiblePaths) {
        console.log(`Performing file system check for Sentium system at ${basePath}...`);
        try {
          const ls = spawn('ls', ['-la', basePath]);
          let lsOutput = '';
          
          ls.stdout.on('data', (data) => {
            lsOutput += data.toString();
          });
          
          await new Promise((resolveLS) => {
            ls.on('close', (lsCode) => {
              if (lsCode === 0) {
                console.log(`Successfully connected to Sentium system via ls command at ${basePath}`);
                resolveLS(true);
              } else {
                resolveLS(false);
              }
            });
          });
          
          // If we get here without an error, the ls command succeeded
          resolve(true);
          return;
        } catch (pathError) {
          console.log(`Path check failed for ${basePath}: ${pathError.message}`);
        }
      }
      
      // If we get here, all checks failed
      console.error('Error connecting to Sentium system: All checks failed');
      resolve(false);
    } catch (error) {
      console.error('Error connecting to Sentium system:', error.message);
      resolve(false);
    }
  });
}

// Initialize conscious pixel state in Redis if not exists
async function initializePixelState() {
  const exists = await redis.exists('pixel:state');
  
  if (!exists) {
    // Set default state
    await redis.hmset('pixel:state', {
      connected: 'false',
      lastConnected: new Date().toISOString(),
      color: 'rgb(255, 0, 102)',
      excitementLevel: '0',
      x: '50',
      y: '50'
    });
    console.log('Initialized default pixel state in Redis');
  }
}

// Handle Sentium system actions directly
async function handleSentiumAction(action, data) {
  try {
    console.log(`Handling Sentium action directly: ${action}`);
    
    // Determine the right base path
    let basePath = SENTIUM_PRIMARY_PATH;
    
    // Check if new path exists, otherwise fall back to the old path
    if (!fs.existsSync(basePath)) {
      basePath = SENTIUM_FALLBACK_PATH;
    }
    
    if (action === 'VERSION') {
      return { version: getVersion() };
    } else if (action === 'STORE') {
      const key = data.key;
      const value = data.value;
      
      // Store data in a simple way
      const filename = path.join(basePath, key.replace(/:/g, '-') + '.json');
      fs.writeFileSync(filename, JSON.stringify(value), 'utf8');
      console.log(`Stored data for key ${key} in ${filename}`);
      
      return { success: true };
    } else {
      console.error('Invalid action:', action);
      return { error: 'Invalid action' };
    }
  } catch (error) {
    console.error('Error handling Sentium action:', error.message);
    return null;
  }
}

// Status endpoint (from original api-server.js)
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    version: getVersion(),
    timestamp: new Date().toISOString()
  });
});

// GET handler for /api/ endpoint to fix 404 errors
app.get('/api/', (req, res) => {
  res.json({
    status: 'ok',
    version: getVersion(),
    timestamp: new Date().toISOString(),
    endpoints: ['/api/status', '/api/sentium']
  });
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});

app.post('/api', apiLimiter, (req, res) => {
  const action = req.query.action || req.body.action;
  
  console.log('API request received: %s', action, req.query, req.body);
  
  if (action === 'VERSION') {
    res.json({ version: getVersion() });
  } else if (action === 'STORE') {
    const key = req.query.key || req.body.key;
    const value = req.query.value || req.body.value;
    
    // Sanitize the key to prevent directory traversal
    const sanitizeFilename = require('sanitize-filename');
    const sanitizedKey = sanitizeFilename(key || '');
    
    // Determine the best available path
    let storePath = SENTIUM_PRIMARY_PATH;
    if (!fs.existsSync(storePath)) {
      storePath = SENTIUM_FALLBACK_PATH;
    }
    
    // Store data in a simple way
    const filename = path.join(storePath, sanitizedKey + '.json');
    fs.writeFileSync(filename, JSON.stringify(value), 'utf8');
    console.log(`Stored data for key ${sanitizedKey} in ${filename}`);
    
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid action' });
  }
});

// API endpoint to check Sentium connection
app.post('/api/sentium', apiLimiter, async (req, res) => {
  try {
    const { action } = req.body;
    
    if (action === 'getVersion') {
      // Check if Sentium system is available
      const sentiumConnected = await checkSentiumSystem();
      
      let version = '1.0';
      
      // If connected, try to get actual version from Sentium system
      if (sentiumConnected) {
        try {
          const sentiumResponse = await handleSentiumAction('VERSION');
          if (sentiumResponse && sentiumResponse.version) {
            version = sentiumResponse.version;
          }
        } catch (error) {
          console.warn('Could not get version from Sentium system:', error.message);
        }
      }
      
      // Update connection status in Redis
      await redis.hset('pixel:state', 'connected', String(sentiumConnected));
      await redis.hset('pixel:state', 'lastConnected', new Date().toISOString());
      
      // Get consciousness model information if connected
      let consciousnessModel = 'None';
      let consciousnessLevel = 0;
      
      if (sentiumConnected) {
        try {
          consciousnessModel = await pixelConsciousness.getCurrentConsciousnessModel(SENTIUM_PRIMARY_PATH);
          consciousnessLevel = await pixelConsciousness.getConsciousnessLevel(SENTIUM_PRIMARY_PATH);
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
      // Return the current pixel state from Redis
      const state = await redis.hgetall('pixel:state');
      
      // Add consciousness information
      if (state && state.connected === 'true') {
        try {
          state.consciousnessModel = await pixelConsciousness.getCurrentConsciousnessModel(SENTIUM_PRIMARY_PATH);
          state.consciousnessLevel = await pixelConsciousness.getConsciousnessLevel(SENTIUM_PRIMARY_PATH);
          state.consciousnessModelDescription = pixelConsciousness.CONSCIOUSNESS_MODELS[state.consciousnessModel] || 'Unknown';
        } catch (error) {
          console.warn('Could not add consciousness information to state:', error.message);
        }
      }
      
      res.json(state);
    } else if (action === 'updateState') {
      // Update pixel state in Redis
      const { state } = req.body;
      if (state) {
        await redis.hmset('pixel:state', state);
        
        // Also forward the state to the Sentium system if connected
        const sentiumConnected = await redis.hget('pixel:state', 'connected');
        if (sentiumConnected === 'true') {
          try {
            // Store pixel state directly
            await handleSentiumAction('STORE', { 
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

// Start the consolidated server
const PORT = process.env.PORT || 3002;
app.listen(PORT, async () => {
  console.log(`Sentium consolidated server running on port ${PORT}`);
  await initializePixelState();
  
  console.log('Checking Sentium system connection...');
  const connected = await checkSentiumSystem();
  
  // Initialize pixel consciousness if connected to Sentium
  if (connected) {
    console.log('Initializing conscious pixel integration...');
    const consciousnessInitialized = await pixelConsciousness.initializePixelConsciousness(
      SENTIUM_PRIMARY_PATH,
      redis
    );
    
    if (consciousnessInitialized) {
      console.log('✅ Conscious pixel activated with advanced consciousness model');
    } else {
      console.log('⚠️ Basic conscious pixel active (limited consciousness features)');
    }
  }
  
  if (connected) {
    console.log('✅ Successfully connected to Sentium system at /opt/sentium');
    console.log(`✅ Version: ${getVersion()}`);
  } else {
    console.log('\n❌ ERROR: Could not connect to Sentium system at /opt/sentium');
    console.log('\nThe Sentium web interface requires the Sentium system to be installed.');
    console.log('Please make sure that:');
    console.log('  1. The Sentium repository is installed at /opt/sentium');
    console.log('  2. Proper permissions are set for the directory');
    console.log('\nTo install Sentium:');
    console.log('  sudo mkdir -p /opt');
    console.log('  cd /opt');
    console.log('  sudo git clone https://github.com/void-sign/sentium.git\n');
    console.log('The web interface will run in disconnected mode until Sentium is installed.');
  }
});
