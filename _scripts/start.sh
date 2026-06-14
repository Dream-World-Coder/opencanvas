#!/bin/bash

echo "Starting MongoDB..."
brew services start mongodb-community
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
