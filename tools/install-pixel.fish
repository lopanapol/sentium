#!/usr/bin/env fish
#
# Copyright (c) 2025 Napol Thanarangkaun (napol@sentium.run)
# Licensed under Sentium License - See LICENSE file for details
#

# install-pixel.fish - Install the conscious pixel scripts to the system

# Default installation directory
set install_dir "/opt/sentium"

# Parse arguments
if test (count $argv) -gt 0
    set install_dir $argv[1]
end

# Get the directory where this script is located
set script_dir (dirname (status -f))
set base_dir (dirname $script_dir)

# Check if the script is running from the correct directory
if not test -f $base_dir/system/pixel/pixel-consciousness.js
    echo "Error: This script must be run from the Sentium repository"
    exit 1
end

# Create directories if they don't exist
if not test -d $install_dir
    echo "Creating installation directory: $install_dir"
    mkdir -p $install_dir
end

if not test -d $install_dir/system/pixel
    mkdir -p $install_dir/system/pixel
end

if not test -d $install_dir/tools
    mkdir -p $install_dir/tools
end

# Copy files
echo "Installing pixel system to $install_dir..."
cp $base_dir/system/pixel/pixel-consciousness.js $install_dir/system/pixel/
cp $base_dir/tools/pixel-control.fish $install_dir/tools/
cp $base_dir/pixel $install_dir/

# Make scripts executable
chmod +x $install_dir/tools/pixel-control.fish
chmod +x $install_dir/pixel

# Check if script has correct line endings (convert if needed)
echo "Ensuring proper line endings for shell scripts..."
if command -v dos2unix >/dev/null
    dos2unix $install_dir/pixel
    dos2unix $install_dir/tools/pixel-control.fish
else
    # Manually fix line endings if dos2unix isn't available
    if grep -q $'\r' $install_dir/pixel
        echo "Converting DOS line endings to Unix for pixel script..."
        tr -d '\r' < $install_dir/pixel > $install_dir/pixel.tmp
        mv $install_dir/pixel.tmp $install_dir/pixel
        chmod +x $install_dir/pixel
    end
    
    if grep -q $'\r' $install_dir/tools/pixel-control.fish
        echo "Converting DOS line endings to Unix for pixel-control.fish..."
        tr -d '\r' < $install_dir/tools/pixel-control.fish > $install_dir/tools/pixel-control.fish.tmp
        mv $install_dir/tools/pixel-control.fish.tmp $install_dir/tools/pixel-control.fish
        chmod +x $install_dir/tools/pixel-control.fish
    end
end

# Verify fish shebang in the scripts
echo "Verifying script headers..."
if not grep -q "#!/usr/bin/env fish" $install_dir/pixel
    echo "#!/usr/bin/env fish" > $install_dir/pixel.tmp
    cat $install_dir/pixel >> $install_dir/pixel.tmp
    mv $install_dir/pixel.tmp $install_dir/pixel
    chmod +x $install_dir/pixel
end

# Test the pixel script
echo "Verifying pixel script..."
if $install_dir/pixel --debug
    echo "✅ Pixel script installed and verified successfully!"
else
    echo "⚠️  Warning: Pixel script verification failed. Please check the installation manually."
end

echo "Successfully installed pixel system to $install_dir"
echo "You can now use: $install_dir/pixel status"
