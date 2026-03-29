#!/bin/bash
# Stop script for Linux systems
# Stops React frontend, Node server, and MongoDB

echo "Stopping React Frontend..."
kill $(cat ~/react.pid) 2>/dev/null
rm -f ~/react.pid

echo "Stopping Node Server..."
pkill -f nodemon 2>/dev/null          # kill nodemon first — stops any restarts
kill $(cat ~/node.pid) 2>/dev/null    # then kill node itself
rm -f ~/node.pid

echo "Stopping MongoDB..."
# Try systemctl first (systemd-based systems), fall back to direct stop
if command -v systemctl &> /dev/null; then
    sudo systemctl stop mongod
else
    # Try to stop mongod process directly
    pkill -f mongod 2>/dev/null || \
    echo "Warning: Could not stop MongoDB automatically. Please stop it manually."
fi

echo "All services stopped."
