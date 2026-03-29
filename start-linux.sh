#!/bin/bash
# Start script for Linux systems
# Starts MongoDB, Node server, and React frontend

echo "Starting MongoDB..."
# Try systemctl first (systemd-based systems), fall back to direct mongod
if command -v systemctl &> /dev/null; then
    sudo systemctl start mongod
    sleep 2
else
    # Start mongod directly (assumes mongod is in PATH)
    mongod --fork --logpath /var/log/mongodb/mongodb.log --dbpath /var/lib/mongodb 2>/dev/null || \
    mongod --fork --logpath ~/mongodb.log --dbpath ~/mongodb_data 2>/dev/null || \
    echo "Warning: Could not start MongoDB automatically. Please start it manually."
    sleep 2
fi

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
