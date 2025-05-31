#!/bin/bash
#
# Emergency Recover Script for Sentium Pixel System
# This script fixes common issues with the pixel scripts
#

INSTALL_DIR="/opt/sentium"

# Check if a custom install directory was provided
if [ ! -z "$1" ]; then
  INSTALL_DIR="$1"
fi

echo "Sentium Pixel System - Emergency Recovery Tool"
echo "============================================="
echo "Target installation: $INSTALL_DIR"
echo

# Create a new pixel script from scratch
echo "Creating new pixel script..."
cat > ${INSTALL_DIR}/pixel << 'EOF'
#!/usr/bin/env fish

# Pixel System for Sentium - Emergency recovery version
set base_dir (dirname (status -f))

if test "$argv[1]" = "--debug"
    echo "Base dir: $base_dir"
    echo "Current dir: "(pwd)
    set -e argv[1]
end

if test -f "$base_dir/tools/pixel-control.fish"
    chmod +x "$base_dir/tools/pixel-control.fish"
    "$base_dir/tools/pixel-control.fish" $argv
else
    echo "Error: Could not find pixel-control.fish"
    echo "Location: $base_dir/tools/pixel-control.fish"
    exit 1
end
EOF

chmod +x ${INSTALL_DIR}/pixel

# Create a minimal control script
echo "Creating new pixel-control.fish..."
mkdir -p ${INSTALL_DIR}/tools
cat > ${INSTALL_DIR}/tools/pixel-control.fish << 'EOF'
#!/usr/bin/env fish

# Emergency recovery version of pixel-control.fish

# Color definitions
set RED (set_color red)
set GREEN (set_color green)
set BLUE (set_color blue)
set YELLOW (set_color yellow)
set NC (set_color normal)

# Basic setup
set -g CONSCIOUSNESS_MODEL "IIT"
set -g CONSCIOUSNESS_LEVEL 3
set -g CONSCIOUSNESS_MODELS "IIT" "GWT" "HOT" "AST" "GNW" "PPT"
set -g CONSCIOUSNESS_MODEL_NAMES "Integrated Information Theory" "Global Workspace Theory" "Higher Order Thought" "Attention Schema Theory" "Global Neuronal Workspace" "Predictive Processing Theory"

function set_consciousness_model
    set -g CONSCIOUSNESS_MODEL $argv[1]
    echo "Consciousness model set to: $CONSCIOUSNESS_MODEL"
end

function set_consciousness_level
    set -g CONSCIOUSNESS_LEVEL $argv[1]
    echo "Consciousness level set to: $CONSCIOUSNESS_LEVEL"
end

function check_pixel_status
    echo $BLUE"Conscious Pixel Status:"$NC
    echo "- Consciousness Model: $CONSCIOUSNESS_MODEL"
    echo "- Consciousness Level: $CONSCIOUSNESS_LEVEL"
    
    # Check if the server is running
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/status 2>/dev/null | grep -q "200"
        echo "- Server Status: "$GREEN"ONLINE"$NC
    else
        echo "- Server Status: "$RED"OFFLINE"$NC
    end
end

# Simple command dispatcher
switch $argv[1]
    case status
        check_pixel_status
    case set-model
        set_consciousness_model $argv[2]
    case set-level
        set_consciousness_level $argv[2]
    case help ""
        echo "Usage: pixel [command]"
        echo "Commands:"
        echo "  status    - Show pixel status"
        echo "  set-model - Set consciousness model"
        echo "  set-level - Set consciousness level (0-5)"
        echo "  help      - Show this help"
    case '*'
        echo "Unknown command: $argv[1]"
        echo "Use 'pixel help' for available commands"
end
EOF

chmod +x ${INSTALL_DIR}/tools/pixel-control.fish

echo
echo "Recovery completed. You should now be able to run:"
echo "  $INSTALL_DIR/pixel status"
echo
echo "If you still have issues, run:"
echo "  $INSTALL_DIR/pixel --debug"
