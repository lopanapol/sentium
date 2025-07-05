const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const sanitizeFilename = require('sanitize-filename');

let pathsConfig;
try {
  pathsConfig = require('../config/paths');
} catch (error) {
  console.log('Custom paths.js not found, using default paths');
  pathsConfig = {
    SENTIUM_PRIMARY_PATH: '/Users/lopanapol/git-repo/sentium',
    SENTIUM_FALLBACK_PATH: '/Users/lopanapol/git-repo/sentium'
  };
}

const SENTIUM_PRIMARY_PATH = pathsConfig.SENTIUM_PRIMARY_PATH;
const SENTIUM_FALLBACK_PATH = pathsConfig.SENTIUM_FALLBACK_PATH;

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
    const virtualEnvPython = path.join(SENTIUM_PRIMARY_PATH, 'sentium_venv', 'bin', 'python3');
    const scriptContent = `#!/usr/bin/env fish
set -x
set -g SENTIUM_PRIMARY_PATH ${SENTIUM_PRIMARY_PATH}
source ${SENTIUM_PRIMARY_PATH}/system/ai-model/unit.fish

# Check for Python and required packages
if not command -sq ${virtualEnvPython}
    echo "Error: Python 3 is required for AI integration"
    set -g AI_SYSTEM_ENABLED false
else if not ${virtualEnvPython} -c "import transformers" 2>/dev/null
    echo "Warning: Transformers package not found"
    set -g AI_SYSTEM_ENABLED false
else if not ${virtualEnvPython} -c "import torch" 2>/dev/null
    echo "Warning: PyTorch not found"
    set -g AI_SYSTEM_ENABLED false
else
    set -g AI_SYSTEM_ENABLED true
end

if test "$AI_SYSTEM_ENABLED" != "true"; and not functions -q ai_set_model
    echo "AI system not enabled. Please install AI dependencies."
    exit 1
end

if test -z "$AI_MODEL_NAME"
    ai_set_model "google/flan-t5-large"
end

conscious_respond "${message}"
`;

    const tempScriptPath = path.join(SENTIUM_PRIMARY_PATH, `temp_script_${Date.now()}.fish`);
    const logFilePath = path.join(SENTIUM_PRIMARY_PATH, `fish_script_log_${Date.now()}.log`);
    fs.writeFileSync(tempScriptPath, scriptContent, { mode: 0o755 }); // Make it executable

    console.log(`Executing fish script from temporary file: ${tempScriptPath}`);
    console.log(`Logging fish script output to: ${logFilePath}`);

    const child = spawn('/usr/local/bin/fish', [tempScriptPath], {
      cwd: SENTIUM_PRIMARY_PATH,
      env: { ...process.env, VIRTUAL_ENV_PYTHON: virtualEnvPython },
      stdio: ['ignore', fs.openSync(logFilePath, 'w'), fs.openSync(logFilePath, 'w')]
    });

    child.on('close', (code) => {
      // Clean up the temporary script file
      fs.unlink(tempScriptPath, (err) => {
        if (err) console.error(`Error deleting temporary script file: ${err}`);
      });

      // Read and print the log file content
      const logContent = fs.readFileSync(logFilePath, 'utf8');
      console.log(`Fish script log content:\n${logContent}`);

      // Clean up the log file
      fs.unlink(logFilePath, (err) => {
        if (err) console.error(`Error deleting log file: ${err}`);
      });

      if (code === 0) {
        const cleanedOutput = logContent.split('\n').filter(line => line.trim() !== '' && !line.startsWith('fish:')).join('\n').trim();
        resolve(`${cleanedOutput || "I am reflecting on my existence."}`);
      } else {
        reject(new Error(`Failed to get AI response. See log for details.`));
      }
    });

    child.on('error', (err) => {
      // Clean up the temporary script file in case of spawn error
      fs.unlink(tempScriptPath, (unlinkErr) => {
        if (unlinkErr) console.error(`Error deleting temporary script file after spawn error: ${unlinkErr}`);
      });
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