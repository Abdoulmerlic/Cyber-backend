#!/bin/bash

# Clean the dist directory
rm -rf dist

# Create dist directory
mkdir -p dist

# Compile TypeScript
tsc

# Copy server.ts to dist
cp server.ts dist/

# Copy src contents to dist
cp -r src/* dist/

# Install production dependencies
npm install --production 