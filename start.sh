#!/bin/bash
# Startup script for server
cd "$(dirname "$0")"

{
  # Make sure everything is up to date so don't need to log in to machine to update
  git pull

  # Wait for internet to be available
  # both cloudflare and indiekit will fail if not up
  # which can happen when this runs on boot
  echo "Checking if ciccarello.me is available"
  while ! ping -c 1 -W 1 ciccarello.me; do
    echo "Retrying in 1 second"
    sleep 1
  done


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
  npm install --fund=false --audit=false
  npm start

} 2>&1 | tee -i start.log
