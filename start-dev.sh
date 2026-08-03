  #!/bin/bash
  # Save as: /Users/jakelease/Documents/Projects/taskcommand-vite/dev/start-dev.sh
  # Run from: /Users/jakelease/Documents/Projects/taskcommand-vite/dev/

  # Get the directory where this script is located
  SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
  cd "$SCRIPT_DIR"

  echo "Working from: $SCRIPT_DIR"

  # Kill any existing processes
  echo "Stopping existing processes..."
  lsof -ti:5173 | xargs kill -9 2>/dev/null
  lsof -ti:7071 | xargs kill -9 2>/dev/null
  pkill -f azurite 2>/dev/null
  pkill -f ngrok 2>/dev/null

  # Wait a moment
  sleep 2

  # Start Azurite with PERSISTENT storage location
  echo "Starting Azurite..."
  azurite --silent --location ~/.azurite --debug ~/.azurite/debug.log &
  sleep 3

  # Initialize tables (from dev/backend directory)
  echo "Initializing Azure Tables..."
  (cd backend && npm run init-tables)

  # Start backend (from dev/backend directory)
  echo "Starting backend..."
  (cd backend && func start --port 7071) &
  sleep 5

  # Start frontend (from dev directory)
  echo "Starting frontend..."
  npm run dev &
  sleep 3

  # Start ngrok with reserved domain
  echo "Starting ngrok with reserved domain..."
  ngrok http 7071 --domain=taskcommand.ngrok.app --log=stdout > ngrok.log &
  sleep 3

  # Show ngrok URL
  echo ""
  echo "Services started!"
  echo "Frontend: http://localhost:5173"
  echo "Backend: http://localhost:7071"
  echo "Ngrok URL: https://taskcommand.ngrok.app"

  echo ""
  echo "All services running. Press Ctrl+C to stop."
  wait

