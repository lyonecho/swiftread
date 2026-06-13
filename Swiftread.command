#!/bin/zsh
# Swiftread launcher — double-click to start the local server (if needed) and open the app.
# Keep the port stable: the reading library lives in browser storage tied to localhost:8744.
cd "$(dirname "$0")"
PORT=8744
if ! lsof -nP -i :$PORT >/dev/null 2>&1; then
  nohup python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
  disown
  sleep 0.5
fi
open "http://localhost:$PORT"
