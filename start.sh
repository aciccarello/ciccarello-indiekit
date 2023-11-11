#!/bin/bash
# Startup script for server
cd "$(dirname "$0")"

# Make sure everything is up to date so don't need to log in to machine to update
git pull
npm install
npm start
