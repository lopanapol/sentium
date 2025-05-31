#!/usr/bin/env fish
#
# Install Noesis services for systemd
#

# Check if running as root
if test (id -u) -ne 0
    echo "This script must be run as root"
    exit 1
end

# Install npm-run-all package
echo "Installing npm dependencies..."
cd /opt/noesis
npm install

# Copy service files
echo "Installing systemd service files..."
cp /opt/noesis/noesis-api.service /etc/systemd/system/
cp /opt/noesis/noesis-web.service /etc/systemd/system/

# Reload systemd daemon
echo "Reloading systemd daemon..."
systemctl daemon-reload

# Enable and start services
echo "Enabling and starting Noesis services..."
systemctl enable noesis-api.service
systemctl enable noesis-web.service
systemctl start noesis-api.service
systemctl start noesis-web.service

# Check status
echo "Service status:"
systemctl status noesis-api.service --no-pager
systemctl status noesis-web.service --no-pager

echo "Installation complete!"
echo "You can check logs with: journalctl -u noesis-api.service -f"
echo "                       or journalctl -u noesis-web.service -f"
