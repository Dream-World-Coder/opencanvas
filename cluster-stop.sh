#!/bin/bash

echo "Stopping React Frontend..."
kill $(cat ~/react.pid) 2>/dev/null
rm -f ~/react.pid

echo "Stopping Node Server (cluster mode — nodemon + all workers)..."
pkill -f nodemon 2>/dev/null           # kill nodemon first — stops it reviving workers
pkill -f "node src/index.js" 2>/dev/null  # kill primary + any orphaned workers
rm -f ~/node.pid

echo "Stopping MongoDB..."
brew services stop mongodb-community

echo "All services stopped."
