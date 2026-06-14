#!/bin/bash

echo "Stopping React Frontend..."
kill $(cat ~/react.pid) 2>/dev/null
rm -f ~/react.pid

echo "Stopping Node Server..."
pkill -f nodemon 2>/dev/null          # kill nodemon first — stops any restarts
kill $(cat ~/node.pid) 2>/dev/null    # then kill node itself
rm -f ~/node.pid

echo "Stopping MongoDB..."
brew services stop mongodb-community

echo "All services stopped."
