#!/usr/bin/env fish
#
# Install Sentium services for systemd
#

# Check if running as root
if test (id -u) -ne 0
    echo "This script must be run as root"
    exit 1
end

# Install npm-run-all package
echo "Installing npm dependencies..."
cd /opt/sentium
npm install

# Copy service files
echo "Installing systemd service files..."
cp /opt/sentium/sentium-api.service /etc/systemd/system/
cp /opt/sentium/sentium-web.service /etc/systemd/system/

# Reload systemd daemon
echo "Reloading systemd daemon..."
systemctl daemon-reload

# Enable and start services
echo "Enabling and starting Sentium services..."
systemctl enable sentium-api.service
systemctl enable sentium-web.service
systemctl start sentium-api.service
systemctl start sentium-web.service

# Check status
echo "Service status:"
systemctl status sentium-api.service --no-pager
systemctl status sentium-web.service --no-pager

echo "Installation complete!"
echo "You can check logs with: journalctl -u sentium-api.service -f"
echo "                       or journalctl -u sentium-web.service -f"
