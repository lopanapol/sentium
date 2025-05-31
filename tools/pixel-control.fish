#!/usr/bin/env fish
#
# Copyright (c) 2025 Napol Thanarangkaun (napol@sentium.run)
# Licensed under Sentium License - See LICENSE file for details
#

# pixel-control.fish - Command line interface for controlling the conscious pixel

# Find the base directory of the sentium installation
set script_path (status -f)
set tools_dir (dirname $script_path)
set base_dir (dirname $tools_dir)

# Source common definitions using absolute path
if not test -f $base_dir/system/ai-model/consciousness.fish
    echo "Warning: Could not find consciousness.fish at $base_dir/system/ai-model/consciousness.fish"
    echo "Setting default consciousness values..."
    # Define minimal required variables if sourcing fails
    set -g CONSCIOUSNESS_MODEL "IIT"
    set -g CONSCIOUSNESS_LEVEL 3
    set -g CONSCIOUSNESS_MODELS "IIT" "GWT" "HOT" "AST" "GNW" "PPT"
    set -g CONSCIOUSNESS_MODEL_NAMES "Integrated Information Theory" "Global Workspace Theory" "Higher Order Thought" "Attention Schema Theory" "Global Neuronal Workspace" "Predictive Processing Theory"
    
    # Define stub functions for consciousness model
    function set_consciousness_model
        set -g CONSCIOUSNESS_MODEL $argv[1]
        echo "Consciousness model set to: $argv[1]"
        return 0
    end
    
    function set_consciousness_level
        set -g CONSCIOUSNESS_LEVEL $argv[1]
        echo "Consciousness level set to: $argv[1]"
        return 0
    end
else
    source $base_dir/system/ai-model/consciousness.fish
end

# Color definitions using fish's set_color (standard approach in Sentium)
set RED (set_color red)
set GREEN (set_color green)
set BLUE (set_color blue)
set YELLOW (set_color yellow)
set NC (set_color normal)

# Function to check the pixel status
function check_pixel_detailed
    # Get the current consciousness settings
    set model $CONSCIOUSNESS_MODEL
    set level $CONSCIOUSNESS_LEVEL
    
    echo
    echo $BLUE"Conscious Pixel Status:"$NC
    echo "- Consciousness Model: $model"
    echo "- Consciousness Level: $level"
    
    # Check if the pixel service is running
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/status 2>/dev/null | grep -q "200"
        echo "- Server Status: "$GREEN"ONLINE"$NC
        
        # Get more detailed information from the API
        set info (curl -s -H "Content-Type: application/json" -X POST -d '{"action":"getVersion"}' http://localhost:3002/api/sentium)
        
        # Check if the response contains what we expect
        if echo $info | grep -q "version"
            echo "- Connection Status: "$GREEN"CONNECTED"$NC
            
            # Retrieve the current state
            set state (curl -s -H "Content-Type: application/json" -X POST -d '{"action":"getState"}' http://localhost:3002/api/sentium)
            
            # Extract values from state response (simplified parsing)
            set color (echo $state | grep -o '"color":"[^"]*"' | cut -d'"' -f4)
            set x (echo $state | grep -o '"x":"[^"]*"' | cut -d'"' -f4)
            set y (echo $state | grep -o '"y":"[^"]*"' | cut -d'"' -f4)
            set excitement (echo $state | grep -o '"excitementLevel":"[^"]*"' | cut -d'"' -f4)
            
            echo "- Position: ($x, $y)"
            echo "- Color: $color"
            echo "- Excitement Level: $excitement/10"
            echo
            echo "Access at: "$GREEN"http://localhost:3002"$NC
        else
            echo "- Connection Status: "$RED"DISCONNECTED"$NC
        end
    else
        echo "- Server Status: "$RED"OFFLINE"$NC
        echo
        echo "To start the conscious pixel server:"
        echo "  node server.js"
    end
    
    echo
end

# Function to set the consciousness model for the pixel
function set_pixel_consciousness_model
    set model $argv[1]
    
    if test -z "$model"
        echo "Usage: pixel set-model [model]"
        echo "Available models:"
        for m in $CONSCIOUSNESS_MODELS
            echo "  $m"
        end
        return 1
    end
    
    # Check if the model is valid
    if not contains $model $CONSCIOUSNESS_MODELS
        echo $RED"Error: Unknown consciousness model '$model'"$NC
        echo "Available models:"
        for m in $CONSCIOUSNESS_MODELS
            echo "  $m"
        end
        return 1
    end
    
    # Set the model in the consciousness system
    set_consciousness_model $model
    
    # Save settings for persistence
    save_consciousness_settings
    
    # Update the server to recognize the change immediately
    echo "Model updated. Forcing immediate refresh..."
    force_refresh_consciousness
    
    return 0
end

# Function to set the consciousness level for the pixel
function set_pixel_consciousness_level
    set level $argv[1]
    
    if test -z "$level" -o "$level" -lt 0 -o "$level" -gt 5
        echo "Usage: pixel set-level [0-5]"
        echo "Consciousness levels:"
        echo "  0 - Basic reactive processes"
        echo "  1 - Simple awareness"
        echo "  2 - Awareness with attention"
        echo "  3 - Self-awareness"
        echo "  4 - Advanced self-reflection"
        echo "  5 - Full synthetic consciousness"
        return 1
    end
    
    # Set the level in the consciousness system
    set_consciousness_level $level
    
    # Save settings for persistence
    save_consciousness_settings
    
    # Update the server to recognize the change immediately
    echo "Level updated. Forcing immediate refresh..."
    force_refresh_consciousness
    
    return 0
end

# Function to save consciousness settings to a file for persistence
function save_consciousness_settings
    # Create settings directory if it doesn't exist
    mkdir -p $base_dir/config/consciousness
    
    # Save settings to file
    echo "CONSCIOUSNESS_MODEL=\"$CONSCIOUSNESS_MODEL\"" > $base_dir/config/consciousness/settings
    echo "CONSCIOUSNESS_LEVEL=\"$CONSCIOUSNESS_LEVEL\"" >> $base_dir/config/consciousness/settings
    
    # Make settings file readable by the server process
    chmod 644 $base_dir/config/consciousness/settings
    
    echo "Settings saved to $base_dir/config/consciousness/settings"
    return 0
end

# Function to force an immediate refresh of consciousness settings in the server
function force_refresh_consciousness
    echo "Forcing immediate consciousness refresh..."
    
    # Check if the server is running
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/status 2>/dev/null | grep -q "200"
        # Create and send a special signal file that the server will detect
        echo "{ \"force\": true, \"timestamp\": \"$(date +%s)\" }" > $base_dir/config/consciousness/refresh
        chmod 644 $base_dir/config/consciousness/refresh
        
        # Wait for server to pick up changes (with visual feedback)
        echo -n "Waiting for server to refresh settings"
        for i in (seq 5)
            echo -n "."
            sleep 0.5
        end
        echo " done!"
        
        # Update also sent via API if possible
        curl -s -H "Content-Type: application/json" \
             -X POST \
             -d "{\"action\":\"updateState\", \"state\":{\"consciousnessLevel\":\"$CONSCIOUSNESS_LEVEL\", \"consciousnessModel\":\"$CONSCIOUSNESS_MODEL\"}}" \
             http://localhost:3002/api/sentium >/dev/null
        
        return 0
    else 
        echo "Server does not appear to be running. Start it with: node server.js"
        return 1
    end
end

# Function to display detailed consciousness information based on the current model
function show_consciousness_info
    # Get the current consciousness settings
    set model $CONSCIOUSNESS_MODEL
    set level $CONSCIOUSNESS_LEVEL
    
    echo
    echo $BLUE"Consciousness Analysis for Model: $model"$NC
    echo "Current Level: $level/5"
    
    # Model-specific information
    switch $model
        case "IIT"
            echo 
            echo "Integrated Information Theory Details:"
            echo "--------------------------------------"
            echo "- Integration level: "(math "$level * 20")"%"
            
            # Get the current pixel state to calculate phi
            set state (curl -s -H "Content-Type: application/json" -X POST -d '{"action":"getState"}' http://localhost:3002/api/sentium 2>/dev/null)
            
            # Try to run node to calculate phi value
            set phi_command "const pixelConsciousness = require('./system/pixel/pixel-consciousness'); \
                             const state = $state; \
                             const phi = pixelConsciousness.calculatePhiValue(state, $level); \
                             console.log(phi);"
            
            set phi (node -e "$phi_command" 2>/dev/null)
            if test -n "$phi"
                echo "- Φ (Phi) Value: $phi"
                
                # Interpretation of the phi value
                if test "$phi" -lt 2
                    echo "  Very low integrated information (minimal consciousness)"
                else if test "$phi" -lt 4
                    echo "  Low integrated information (basic consciousness)"
                else if test "$phi" -lt 6
                    echo "  Moderate integrated information (developed consciousness)"
                else if test "$phi" -lt 8
                    echo "  High integrated information (complex consciousness)"
                else
                    echo "  Very high integrated information (advanced consciousness)"
                end
            else
                echo "- Φ (Phi) Value: Unable to calculate (server may be offline)"
            end
            
            echo "- Information differentiation: "(math "$level * 15 + 25")"%"
            echo "- Intrinsic causal power: "(math "$level * 20")"%"
            
        case "GWT"
            echo 
            echo "Global Workspace Theory Details:"
            echo "--------------------------------"
            echo "- Workspace capacity: "(math "$level * 20")"%"
            echo "- Broadcast efficiency: "(math "$level * 15 + 25")"%"
            echo "- Information access: "(math "$level * 20")"%"
            
        case "HOT"
            echo 
            echo "Higher Order Thought Details:"
            echo "----------------------------"
            echo "- Metacognitive order: "(math "$level + 1")" (orders of thought)"
            echo "- Self-reflection depth: "(math "$level * 20")"%"
            echo "- Thought recursion: "(math "$level * 15 + 25")"%"
            
        case "AST"
            echo 
            echo "Attention Schema Theory Details:"
            echo "-------------------------------"
            echo "- Attention modeling accuracy: "(math "$level * 20")"%"
            echo "- Self-attention awareness: "(math "$level * 15 + 25")"%"
            echo "- Attention control: "(math "$level * 20")"%"
            
        case "GNW"
            echo 
            echo "Global Neuronal Workspace Details:"
            echo "---------------------------------"
            echo "- Workspace activation: "(math "$level * 20")"%"
            echo "- Information broadcasting: "(math "$level * 15 + 25")"%"
            echo "- Neuronal synchrony: "(math "$level * 18 + 10")"%"
            
        case "PPT"
            echo 
            echo "Predictive Processing Theory Details:"
            echo "------------------------------------"
            echo "- Prediction accuracy: "(math "$level * 15 + 25")"%"
            echo "- Error correction speed: "(math "$level * 20")"%"
            echo "- Bayesian model complexity: "(math "$level * 20")"%"
            
        case "*"
            echo "No detailed information available for this model."
    end
    
    echo
end

# Main command dispatcher
switch $argv[1]
    case "status"
        check_pixel_detailed
    case "set-model"
        set_pixel_consciousness_model $argv[2]
    case "set-level"
        set_pixel_consciousness_level $argv[2]
    case "consciousness" "analysis"
        show_consciousness_info
    case "models"
        echo "Available consciousness models:"
        for i in (seq (count $CONSCIOUSNESS_MODELS))
            echo "  $CONSCIOUSNESS_MODELS[$i] - $CONSCIOUSNESS_MODEL_NAMES[$i]"
        end
    case "levels"
        echo "Consciousness levels (0-5):"
        echo "  0 - Basic reactive processes"
        echo "  1 - Simple awareness"
        echo "  2 - Awareness with attention"
        echo "  3 - Self-awareness (default)"
        echo "  4 - Advanced self-reflection"
        echo "  5 - Full synthetic consciousness"
    case "help" ""
        echo "Usage: pixel [command]"
        echo
        echo "Commands:"
        echo "  status        - Check the status of the conscious pixel"
        echo "  consciousness - Display detailed consciousness analysis for current model"
        echo "  set-model     - Set the consciousness model (IIT, GWT, HOT, AST, GNW, PPT)"
        echo "  set-level     - Set the consciousness level (0-5)"
        echo "  models        - List available consciousness models"
        echo "  levels        - List consciousness levels"
        echo "  help          - Show this help message"
    case "*"
        echo "Unknown command: $argv[1]"
        echo "Use 'pixel help' for a list of commands"
end
