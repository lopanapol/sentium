
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const sanitizeFilename = require('sanitize-filename');

let pathsConfig;
try {
  pathsConfig = require('../config/paths');
} catch (error) {
  console.log('⚠️ Custom paths.js not found, using default paths');
  pathsConfig = {
    SENTIUM_PRIMARY_PATH: '/opt/sentium',
    SENTIUM_FALLBACK_PATH: '/opt/sentium'
  };
}

const SENTIUM_PRIMARY_PATH = process.env.SENTIUM_PATH || pathsConfig.SENTIUM_PRIMARY_PATH;
const SENTIUM_FALLBACK_PATH = process.env.SENTIUM_FALLBACK_PATH || pathsConfig.SENTIUM_FALLBACK_PATH;

function getVersion() {
  try {
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

function checkSentiumSystem() {
  return new Promise(async (resolve) => {
    try {
      const possiblePaths = [SENTIUM_PRIMARY_PATH, SENTIUM_FALLBACK_PATH];
      for (const basePath of possiblePaths) {
        if (fs.existsSync(`${basePath}/VERSION`)) {
          console.log(`Successfully connected to Sentium system via file system at ${basePath}`);
          resolve(true);
          return;
        }
      }
      for (const basePath of possiblePaths) {
        console.log(`Performing file system check for Sentium system at ${basePath}...`);
        try {
          const ls = spawn('ls', ['-la', basePath]);
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
          resolve(true);
          return;
        } catch (pathError) {
          console.log(`Path check failed for ${basePath}: ${pathError.message}`);
        }
      }
      console.error('Error connecting to Sentium system: All checks failed');
      resolve(false);
    } catch (error) {
      console.error('Error connecting to Sentium system:', error.message);
      resolve(false);
    }
  });
}

async function handleSentiumAction(action, data) {
  try {
    console.log(`Handling Sentium action directly: ${action}`);
    let basePath = SENTIUM_PRIMARY_PATH;
    if (!fs.existsSync(basePath)) {
      basePath = SENTIUM_FALLBACK_PATH;
    }
    if (action === 'VERSION') {
      return { version: getVersion() };
    } else if (action === 'STORE') {
      const key = data.key;
      const value = data.value;
      const filename = path.join(basePath, sanitizeFilename(key || '').replace(/:/g, '-') + '.json');
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

module.exports = {
  getVersion,
  checkSentiumSystem,
  handleSentiumAction,
  SENTIUM_PRIMARY_PATH,
  SENTIUM_FALLBACK_PATH
};
