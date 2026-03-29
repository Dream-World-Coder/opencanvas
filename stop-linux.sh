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
# Use systemctl for systemd-based Linux distributions
sudo systemctl stop mongod

echo "All services stopped."
