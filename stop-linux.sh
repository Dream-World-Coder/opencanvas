#!/bin/bash
# Linux Stop Script for OpenCanvas
# Stops React frontend, Node.js server, and MongoDB

set -e  # Exit on error

echo "🛑 Stopping OpenCanvas services..."

# Stop React Frontend
echo "⚛️  Stopping React Frontend..."
if [ -f /tmp/react.pid ]; then
    kill $(cat /tmp/react.pid) 2>/dev/null || true
    rm -f /tmp/react.pid
    echo "✅ React frontend stopped"
else
    # Fallback: kill by process name
    pkill -f "vite" 2>/dev/null || true
    pkill -f "react" 2>/dev/null || true
    echo "⚠️  PID file not found, tried to kill by process name"
fi

# Stop Node.js Server
echo "🔧 Stopping Node Server..."
if [ -f /tmp/node.pid ]; then
    NODE_PID=$(cat /tmp/node.pid)
    kill $NODE_PID 2>/dev/null || true
    # Also kill nodemon to prevent restarts
    pkill -f "nodemon" 2>/dev/null || true
    rm -f /tmp/node.pid
    echo "✅ Node server stopped"
else
    # Fallback: kill by process name
    pkill -f "nodemon" 2>/dev/null || true
    pkill -f "node.*server" 2>/dev/null || true
    echo "⚠️  PID file not found, tried to kill by process name"
fi

# Stop MongoDB
echo "📦 Stopping MongoDB..."
if command -v systemctl &> /dev/null; then
    sudo systemctl stop mongod
    echo "✅ MongoDB stopped via systemctl"
else
    # Fallback: stop mongod directly
    sudo pkill mongod 2>/dev/null || true
    echo "⚠️  systemctl not found, tried to stop mongod directly"
fi

echo ""
echo "👋 All services stopped successfully!"
