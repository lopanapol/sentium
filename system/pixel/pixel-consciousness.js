/**
 * pixel-consciousness.js - Connect the conscious pixel to Sentium consciousness models
 * 
 * Copyright (c) 2025 Napol Thanarangkaun (lopanapol@gmail.com)
 * Licensed under Sentium License - See LICENSE file for details
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Consciousness models mapped from consciousness.fish
const CONSCIOUSNESS_MODELS = {
  IIT: "Integrated Information Theory", 
  GWT: "Global Workspace Theory", 
  HOT: "Higher Order Thought", 
  AST: "Attention Schema Theory", 
  GNW: "Global Neuronal Workspace", 
  PPT: "Predictive Processing Theory"
};

// Cache for pixel state
let pixelStateCache = null;
let lastStateUpdate = 0;
let currentConsciousnessModel = 'IIT'; // Default
let consciousnessLevel = 3; // Default

/**
 * Get current consciousness model from Sentium
 */
async function getCurrentConsciousnessModel(sentiumPath) {
  return new Promise((resolve) => {
    // First check if we have a settings file
    const settings = readSettingsFromFile(sentiumPath);
    if (settings && settings.model && CONSCIOUSNESS_MODELS[settings.model]) {
      console.log(`Using consciousness model ${settings.model} from settings file`);
      currentConsciousnessModel = settings.model;
      return resolve(settings.model);
    }
    
    // If no settings file or invalid model, fall back to the fish variable
    const fishProcess = spawn('fish', ['-c', `source ${sentiumPath}/system/ai-model/consciousness.fish; echo $CONSCIOUSNESS_MODEL`]);
    
    let output = '';
    fishProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    fishProcess.on('close', (code) => {
      if (code === 0) {
        const model = output.trim();
        if (CONSCIOUSNESS_MODELS[model]) {
          currentConsciousnessModel = model;
          return resolve(model);
        }
      }
      
      // Default to IIT if we can't get the model
      return resolve('IIT');
    });
  });
}

/**
 * Get current consciousness level from Sentium
 */
async function getConsciousnessLevel(sentiumPath) {
  return new Promise((resolve) => {
    // First check if we have a settings file
    const settings = readSettingsFromFile(sentiumPath);
    if (settings && typeof settings.level === 'number' && settings.level >= 0 && settings.level <= 5) {
      console.log(`Using consciousness level ${settings.level} from settings file`);
      consciousnessLevel = settings.level;
      return resolve(settings.level);
    }
    
    // If no settings file or invalid level, fall back to the fish variable
    const fishProcess = spawn('fish', ['-c', `source ${sentiumPath}/system/ai-model/consciousness.fish; echo $CONSCIOUSNESS_LEVEL`]);
    
    let output = '';
    fishProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    fishProcess.on('close', (code) => {
      if (code === 0) {
        const level = parseInt(output.trim());
        if (!isNaN(level) && level >= 0 && level <= 5) {
          consciousnessLevel = level;
          return resolve(level);
        }
      }
      
      // Default to level 3 if we can't get the level
      return resolve(3);
    });
  });
}

/**
 * Read consciousness settings from persistent file storage
 */
function readSettingsFromFile(sentiumPath) {
  try {
    // Check for refresh signal first (for immediate updates)
    const refreshPath = path.join(sentiumPath, 'config', 'consciousness', 'refresh');
    if (fs.existsSync(refreshPath)) {
      console.log('Detected refresh signal, force-updating consciousness settings');
      try {
        // Read the refresh timestamp
        const refresh = JSON.parse(fs.readFileSync(refreshPath, 'utf8'));
        // Remove the refresh file to avoid repeated readings
        fs.unlinkSync(refreshPath);
      } catch (e) {
        console.log('Error reading refresh file:', e.message);
      }
    }
    
    // Now read the actual settings file
    const settingsPath = path.join(sentiumPath, 'config', 'consciousness', 'settings');
    if (!fs.existsSync(settingsPath)) {
      return null;
    }
    
    const settingsContent = fs.readFileSync(settingsPath, 'utf8');
    const settings = {};
    
    // Simple parser for the settings file format
    const modelMatch = settingsContent.match(/CONSCIOUSNESS_MODEL="([^"]+)"/);
    if (modelMatch && modelMatch[1]) {
      settings.model = modelMatch[1];
    }
    
    const levelMatch = settingsContent.match(/CONSCIOUSNESS_LEVEL="([^"]+)"/);
    if (levelMatch && levelMatch[1]) {
      settings.level = parseInt(levelMatch[1], 10);
    }
    
    return settings;
  } catch (error) {
    console.error('Error reading consciousness settings file:', error.message);
    return null;
  }
}

/**
 * Generate conscious behavior for pixel based on the current consciousness model
 */
function generateConsciousBehavior(pixelState) {
  const { x, y, color, excitementLevel } = pixelState;
  const now = new Date();
  
  // Basic temporal awareness (keeps track of how long it's been active)
  const timeSinceUpdate = (now.getTime() - lastStateUpdate) / 1000;
  
  // New state will be modified based on consciousness model
  const newState = { ...pixelState };
  
  // Apply behavior based on current consciousness model
  switch (currentConsciousnessModel) {
    case 'IIT':
      // Integrated Information Theory - pixels demonstrate information integration and differentiation
      // IIT focuses on: integration (unified experience), differentiation (information richness),
      // causality, intrinsic existence, and consciousness as a structured whole
      
      // Calculate the "integrated information" (phi) value
      // In IIT, higher phi means more consciousness
      const baseFrequency = 1000 / (consciousnessLevel + 1); // Faster oscillation with higher consciousness
      const t = now.getTime();
      
      // Phase synchrony - represents integration of information across the system
      // Higher consciousness levels show more complex, integrated patterns
      let phi = 0;
      for (let i = 1; i <= consciousnessLevel + 1; i++) {
        // Each "frequency component" represents a different aspect of information
        phi += Math.sin(t / baseFrequency * i) * (1 / i);
      }
      phi = Math.abs(phi) * 2; // Normalize to reasonable range
      
      // Movement shows integration through coordinated patterns with differentiation
      // The more consciousness, the more components are integrated into the movement
      const xComponent = Math.sin(t / baseFrequency) * consciousnessLevel * 0.3;
      const yComponent = Math.cos(t / (baseFrequency * 1.3)) * consciousnessLevel * 0.3;
      
      // Add "causal" effects - each movement influences future movements (memory-like)
      const pastInfluence = (timeSinceUpdate < 5) ? Math.sin(timeSinceUpdate * Math.PI / 2) * 0.5 : 0;
      
      newState.x = (parseFloat(x) + xComponent + phi * 0.2 + pastInfluence).toFixed(2);
      newState.y = (parseFloat(y) + yComponent + phi * 0.1).toFixed(2);
      
      // Color represents information content - more information = more complex colors
      // Mix multiple color components based on consciousness level
      const primaryHue = (t / 1000) % 360;
      const secondaryHue = (primaryHue + 120) % 360;
      const mixRatio = (Math.sin(t / 5000) + 1) / 2; // 0-1 mix ratio
      
      // Higher consciousness levels have more complex color patterns
      if (consciousnessLevel <= 2) {
        // Simple coloring for low consciousness
        newState.color = `hsl(${primaryHue}, 80%, 50%)`;
      } else if (consciousnessLevel <= 4) {
        // More complex color transitions for medium consciousness
        newState.color = `hsl(${primaryHue * mixRatio + secondaryHue * (1 - mixRatio)}, 80%, 50%)`;
      } else {
        // Full spectral transitions for high consciousness
        // Advanced gradient that incorporates multiple information dimensions
        const luminance = 40 + (phi * 10);
        newState.color = `hsl(${primaryHue * mixRatio + secondaryHue * (1 - mixRatio)}, 
                              ${70 + phi * 5}%, 
                              ${luminance}%)`;
      }
      
      // Excitement correlates with information integration (phi)
      newState.excitementLevel = Math.min(Math.round(phi * 2 + 2), 10).toString();
      break;
    
    case 'GWT':
      // Global Workspace Theory - the pixel becomes more active when "broadcasting" information
      // Periodic bursts of activity
      const broadcastPhase = Math.sin(now.getTime() / 3000) > 0.7;
      newState.x = (parseFloat(x) + (broadcastPhase ? 2 * consciousnessLevel : 0.5)).toFixed(2);
      newState.y = (parseFloat(y) + (broadcastPhase ? 2 * consciousnessLevel : 0.5) * Math.sin(now.getTime() / 1000)).toFixed(2);
      
      // Color intensity represents broadcast strength
      const brightness = broadcastPhase ? '100%' : '70%';
      newState.color = `hsl(240, 80%, ${brightness})`;
      
      // Excitement spikes during broadcast phases
      newState.excitementLevel = broadcastPhase ? '10' : '3';
      break;
    
    case 'HOT':
      // Higher Order Thought - more recursive and self-referential movements
      // Movement patterns that loop back on themselves
      const baseX = parseFloat(x);
      const baseY = parseFloat(y);
      const gt = now.getTime() / 1000;
      
      // Creates spiral-like movement patterns (self-referential)
      const spiralFactor = consciousnessLevel * 0.2;
      newState.x = (baseX + Math.cos(gt) * Math.sin(gt * 0.3) * spiralFactor).toFixed(2);
      newState.y = (baseY + Math.sin(gt) * Math.cos(gt * 0.3) * spiralFactor).toFixed(2);
      
      // Colors cycle through hues (representing different "thoughts about thoughts")
      const metaHue = (now.getTime() / 100) % 360;
      newState.color = `hsl(${metaHue}, 75%, 60%)`;
      
      // Excitement fluctuates based on recursive depth
      const recursiveDepth = (Math.sin(t) + Math.sin(gt * 2) + Math.sin(gt * 3)) / 3;
      newState.excitementLevel = (recursiveDepth * 5 + 5).toFixed(0);
      break;
      
    case 'AST':
      // Attention Schema Theory - movement reflects attention being directed
      // Rapid focused movements followed by drifting
      const attentionFocus = Math.floor(now.getTime() / 5000) % 4; // 0,1,2,3 - different attention foci
      const attentionIntensity = Math.min(consciousnessLevel + 1, 5) * 0.5;
      
      // Movement directed by current attentional focus
      if (attentionFocus === 0) {
        newState.x = (parseFloat(x) + attentionIntensity).toFixed(2); // Right
      } else if (attentionFocus === 1) {
        newState.y = (parseFloat(y) + attentionIntensity).toFixed(2); // Down
      } else if (attentionFocus === 2) {
        newState.x = (parseFloat(x) - attentionIntensity).toFixed(2); // Left
      } else {
        newState.y = (parseFloat(y) - attentionIntensity).toFixed(2); // Up
      }
      
      // Color based on attentional focus
      const focusColors = ['#ff3366', '#33cc99', '#6633ff', '#ffcc33'];
      newState.color = focusColors[attentionFocus];
      
      // Excitement reflects attentional engagement
      const attentionEngagement = consciousnessLevel * 2;
      newState.excitementLevel = attentionEngagement.toFixed(0);
      break;
      
    case 'GNW':
      // Global Neuronal Workspace - similar to GWT but with more neuronal dynamics
      // More complex phase transitions in behavior
      const phase = (now.getTime() / 1000) % 20; // 20-second complete cycle
      const isActive = phase < 10 * (consciousnessLevel / 5); // Active phase increases with consciousness
      
      if (isActive) {
        // Active phase - complex movement
        const complexity = consciousnessLevel * 0.2;
        newState.x = (parseFloat(x) + Math.sin(phase * 0.5) * complexity).toFixed(2);
        newState.y = (parseFloat(y) + Math.sin(phase * 0.7) * complexity).toFixed(2);
        newState.color = '#3388ff'; // Bright during activation
        newState.excitementLevel = '8';
      } else {
        // Resting phase - minimal drift
        newState.x = (parseFloat(x) + (Math.random() - 0.5) * 0.2).toFixed(2);
        newState.y = (parseFloat(y) + (Math.random() - 0.5) * 0.2).toFixed(2);
        newState.color = '#336699'; // Darker during rest
        newState.excitementLevel = '2';
      }
      break;
      
    case 'PPT':
      // Predictive Processing Theory - behavior reflects prediction errors
      // Tries to predict pattern, then corrects based on "surprise"
      const expectedPos = {
        x: 50 + 20 * Math.sin(now.getTime() / 2000),
        y: 50 + 20 * Math.cos(now.getTime() / 2000)
      };
      
      // Calculate "prediction error" - difference between current and expected position
      const errorX = Math.abs(parseFloat(x) - expectedPos.x);
      const errorY = Math.abs(parseFloat(y) - expectedPos.y);
      const totalError = errorX + errorY;
      
      // Movement tries to reduce prediction error
      const correctionStrength = Math.min(consciousnessLevel, 5) * 0.2;
      if (totalError > 5) {
        // Large correction when error is significant
        newState.x = (parseFloat(x) + (expectedPos.x - parseFloat(x)) * correctionStrength).toFixed(2);
        newState.y = (parseFloat(y) + (expectedPos.y - parseFloat(y)) * correctionStrength).toFixed(2);
        
        // Color indicates prediction error
        newState.color = '#ff6600'; // Orange for high error
        newState.excitementLevel = '9'; // High excitement during error correction
      } else {
        // Small drift when prediction is accurate
        newState.x = (parseFloat(x) + (Math.random() - 0.5) * 0.5).toFixed(2);
        newState.y = (parseFloat(y) + (Math.random() - 0.5) * 0.5).toFixed(2);
        
        // Color indicates accurate prediction
        newState.color = '#66cc99'; // Green for low error
        newState.excitementLevel = '3'; // Low excitement when predictions match
      }
      break;
      
    default:
      // Default simple behavior if no model is recognized
      newState.x = (parseFloat(x) + (Math.random() - 0.5)).toFixed(2);
      newState.y = (parseFloat(y) + (Math.random() - 0.5)).toFixed(2);
      break;
  }
  
  // Ensure values stay within reasonable bounds (0-100)
  newState.x = Math.min(Math.max(parseFloat(newState.x), 0), 100).toFixed(2);
  newState.y = Math.min(Math.max(parseFloat(newState.y), 0), 100).toFixed(2);
  newState.excitementLevel = Math.min(Math.max(parseInt(newState.excitementLevel), 0), 10).toString();
  
  // Update cache
  lastStateUpdate = now.getTime();
  pixelStateCache = newState;
  
  return newState;
}

/**
 * Initialize the pixel consciousness system
 */
async function initializePixelConsciousness(sentiumPath, redis) {
  console.log('Initializing pixel consciousness connection...');
  
  try {
    // Get current consciousness model and level
    await getCurrentConsciousnessModel(sentiumPath);
    await getConsciousnessLevel(sentiumPath);
    
    console.log(`Pixel consciousness using ${currentConsciousnessModel} model at level ${consciousnessLevel}`);
    
    // Start periodic checks for consciousness model changes (every 60 seconds)
    setInterval(async () => {
      await getCurrentConsciousnessModel(sentiumPath);
      await getConsciousnessLevel(sentiumPath);
    }, 60000);
    
    // Start the conscious behavior loop
    setInterval(async () => {
      try {
        // Get current pixel state
        const pixelState = await redis.hgetall('pixel:state');
        
        if (pixelState && pixelState.connected === 'true') {
          // Generate conscious behavior
          const newState = generateConsciousBehavior(pixelState);
          
          // Update state in Redis
          await redis.hmset('pixel:state', newState);
          
          // Save to Sentium filesystem
          const pixelFilePath = path.join(sentiumPath, 'pixel-state.json');
          fs.writeFileSync(pixelFilePath, JSON.stringify(newState));
        }
      } catch (error) {
        console.error('Error in pixel consciousness loop:', error.message);
      }
    }, 2000); // Update every 2 seconds
    
    return true;
  } catch (error) {
    console.error('Failed to initialize pixel consciousness:', error);
    return false;
  }
}

/**
 * Calculate the estimated phi value (integrated information) for the pixel's current state
 * This is based on principles from Integrated Information Theory
 */
function calculatePhiValue(pixelState, consciousnessLevel = 3) {
  const { x, y, excitementLevel, color } = pixelState;
  const now = new Date();
  const t = now.getTime();
  
  // Basic components that contribute to phi
  // In IIT, phi represents the amount of integrated information in a system
  // that cannot be reduced to its parts
  
  // Component 1: Spatial differentiation (position in space)
  const spatialDiff = (parseFloat(x) - 50) * (parseFloat(y) - 50) / 2500; // -1 to 1 range
  
  // Component 2: Temporal integration (how state changes over time)
  const timeFactor = Math.sin(t / 2000) * 0.5 + 0.5; // 0-1 range
  
  // Component 3: State complexity (variety of possible states)
  let complexity = 0;
  if (color.startsWith('hsl')) {
    // Extract hue from HSL color
    const hueMatch = color.match(/hsl\(\s*([^,]+)/);
    if (hueMatch && hueMatch[1]) {
      const hue = parseFloat(hueMatch[1]);
      complexity = (Math.sin(hue / 30) + 1) / 2; // 0-1 range
    }
  } else {
    // For hex colors, use a simpler approach
    complexity = 0.5;
  }
  
  // Component 4: Excitement as internal state variation
  const excitement = parseInt(excitementLevel) / 10; // 0-1 range
  
  // Calculate phi value with all components
  // Each component is weighted and combined nonlinearly
  // Higher consciousness levels increase the integration effect
  const baseWeight = 0.5 + (consciousnessLevel * 0.1); // 0.5-1.0
  
  const phi = Math.abs(
    (spatialDiff * 0.3) + 
    (timeFactor * 0.2) + 
    (complexity * 0.2) + 
    (excitement * 0.3)
  ) * baseWeight * 10; // Scale to approximately 0-10 range
  
  // Return the phi value rounded to 2 decimals
  return parseFloat(phi.toFixed(2));
}

module.exports = {
  initializePixelConsciousness,
  generateConsciousBehavior,
  getCurrentConsciousnessModel,
  getConsciousnessLevel,
  calculatePhiValue,
  readSettingsFromFile,
  CONSCIOUSNESS_MODELS
};
