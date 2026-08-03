#!/bin/bash
# TaskCommand dev startup.
#
# Default: frontend only — talks to the deployed Railway backend via
# VITE_BACKEND_URL in .env.local (production data!).
#
# --local-backend: also start Azurite + the Functions host on :7071 for
# backend development. Point VITE_BACKEND_URL at http://localhost:7071
# in .env.local when using this mode.

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "Working from: $SCRIPT_DIR"

echo "Stopping existing processes..."
lsof -ti:5173 | xargs kill -9 2>/dev/null

if [ "$1" = "--local-backend" ]; then
  lsof -ti:7071 | xargs kill -9 2>/dev/null
  pkill -f azurite 2>/dev/null
  sleep 2

  echo "Starting Azurite..."
  azurite --silent --location ~/.azurite --debug ~/.azurite/debug.log &
  sleep 3

  echo "Initializing Azure Tables..."
  (cd backend && npm run init-tables)

  echo "Starting backend..."
  (cd backend && func start --port 7071) &
  sleep 5
fi

echo "Starting frontend..."
npm run dev &
sleep 3

echo ""
echo "Services started!"
echo "Frontend: http://localhost:5173"
if [ "$1" = "--local-backend" ]; then
  echo "Backend:  http://localhost:7071 (local Azurite data)"
else
  echo "Backend:  $(grep VITE_BACKEND_URL .env.local | cut -d= -f2) (from .env.local)"
fi

echo ""
echo "All services running. Press Ctrl+C to stop."
wait
