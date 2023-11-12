#!/bin/bash
# Startup script for server
cd "$(dirname "$0")"

# Make sure everything is up to date so don't need to log in to machine to update
git pull

# Make sure cloudflare tunnel is up
if pgrep -x cloudflared > /dev/null
then
  echo "Tunnel already running"
else
  if command -v cloudflared &> /dev/null
  then
    echo "Starting Cloudflare tunnel"
    cloudflared tunnel run indiekit &
  else
    # Don't expect to have cloudflared tunnel on local machine
    echo "Unable to find cloudflared command. Skipping tunnel"
  fi
fi

# Start indiekit
npm install
npm start
