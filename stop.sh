#!/bin/bash

echo "Stopping React Frontend..."
kill $(cat ~/react.pid)
rm ~/react.pid

echo "Stopping Node Server..."
kill $(cat ~/node.pid)
rm ~/node.pid

echo "Stopping MongoDB..."
brew services stop mongodb-community
sleep 2

echo "All services stopped."
