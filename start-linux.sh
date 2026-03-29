#!/bin/bash
# Linux Start Script for OpenCanvas
# Starts MongoDB, Node.js server, and React frontend

set -e  # Exit on error

echo "🚀 Starting OpenCanvas on Linux..."

# Start MongoDB using systemctl (common on most Linux distros)
echo "📦 Starting MongoDB..."
if command -v systemctl &> /dev/null; then
    sudo systemctl start mongod
    sleep 2
    echo "✅ MongoDB started via systemctl"
else
    # Fallback: start mongod directly
    echo "⚠️  systemctl not found, trying to start mongod directly..."
    mongod --fork --logpath /var/log/mongodb.log --dbpath /var/lib/mongodb 2>/dev/null || {
        echo "❌ Failed to start MongoDB. Please install and configure MongoDB first."
        exit 1
    }
    sleep 2
    echo "✅ MongoDB started directly"
fi

# Start Node.js Server
echo "🔧 Starting Node Server..."
cd "$(dirname "$0")/server"
pnpm dev &
# Wait for nodemon to start
sleep 2
NODE_PID=$(pgrep -f "nodemon" | head -1 || echo "")
if [ -z "$NODE_PID" ]; then
    NODE_PID=$(pgrep -f "node" | head -1 || echo "")
fi
cd ..

if [ -n "$NODE_PID" ]; then
    echo "✅ Node server started (PID: $NODE_PID)"
    echo "$NODE_PID" > /tmp/node.pid
else
    echo "❌ Failed to start Node server"
    exit 1
fi

# Start React Frontend
echo "⚛️  Starting React Frontend..."
cd "$(dirname "$0")/client"
pnpm dev &
REACT_PID=$!
cd ..

echo "✅ React frontend started (PID: $REACT_PID)"
echo "$REACT_PID" > /tmp/react.pid

echo ""
echo "🎉 All services started successfully!"
echo "   - MongoDB: Running"
echo "   - Server: http://localhost:3001"
echo "   - Frontend: http://localhost:5173"
echo ""
echo "💡 To stop services, run: ./stop-linux.sh"
