#!/bin/bash
# Start script for Linux systems
# Starts MongoDB, Node server, and React frontend

echo "Starting MongoDB..."
# Use systemctl for systemd-based Linux distributions
sudo systemctl start mongod
sleep 2

echo "Starting Node Server..."
cd server
pnpm dev &
sleep 1
NODE_PID=$(pgrep -f nodemon | head -1)  # nodemon is the real parent, not pnpm
cd ..

echo "Starting React Frontend..."
cd client
pnpm dev &
REACT_PID=$!
cd ..

echo "All services started."
echo $NODE_PID > ~/node.pid
echo $REACT_PID > ~/react.pid
