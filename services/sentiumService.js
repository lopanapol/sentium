
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
    SENTIUM_PRIMARY_PATH: '/Users/lopanapol/git-repo/sentium',
    SENTIUM_FALLBACK_PATH: '/Users/lopanapol/git-repo/sentium'
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

async function generateChatReply(message) {
  return new Promise((resolve, reject) => {
    // For now, we'll just trigger a self-reflection.
    // In a more advanced setup, we'd pass the user's message to the AI for a direct response,
    // and then perhaps augment that response with conscious-like statements.
    const command = `fish -c "source ${SENTIUM_PRIMARY_PATH}/system/ai-model/unit.fish; source ${SENTIUM_PRIMARY_PATH}/system/ai-model/consciousness.fish; if test \"$AI_SYSTEM_ENABLED\" != \"true\"; and not functions -q ai_set_model; echo \"AI system not enabled. Please install AI dependencies.\"; exit 1; end; if test -z \"$AI_MODEL_NAME\"; ai_set_model \"google/flan-t5-large\"; end; conscious_respond \"${message}\""`;
    console.log(`Executing fish command: ${command}`);

    const child = spawn(command, { shell: true, cwd: SENTIUM_PRIMARY_PATH });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        // Clean up the output to remove shell prompts or extra newlines
        const cleanedOutput = output.split('\n').filter(line => line.trim() !== '' && !line.startsWith('fish:')).join('\n').trim();
        resolve(`Sentium AI says: ${cleanedOutput || "I am reflecting on my existence."}`);
      } else {
        console.error(`Fish script exited with code ${code}: ${errorOutput}`);
        reject(new Error(`Failed to get AI response: ${errorOutput}`));
      }
    });

    child.on('error', (err) => {
      console.error('Failed to start fish process:', err);
      reject(new Error('Failed to start AI process.'));
    });
  });
}

module.exports = {
  getVersion,
  checkSentiumSystem,
  handleSentiumAction,
  generateChatReply,
  SENTIUM_PRIMARY_PATH,
  SENTIUM_FALLBACK_PATH
};
