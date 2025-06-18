#!/bin/bash

# Exit if any command fails
set -e

echo "🔧 Compiling TypeScript with npx tsc..."
npx tsc

echo "🐳 Building and starting Docker containers..."
docker compose up --build