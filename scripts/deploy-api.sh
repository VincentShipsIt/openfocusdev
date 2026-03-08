#!/bin/bash
set -e

REPO_DIR="/home/openclaw/www/shipshitdev/vincentshipsit/todo"
API_DIR="$REPO_DIR/core/apps/api"

echo "==> Pulling latest master..."
cd $REPO_DIR
git pull origin master

echo "==> Installing dependencies..."
cd $REPO_DIR
bun install --frozen-lockfile

echo "==> Building API..."
cd $API_DIR
bun run build

echo "==> Restarting PM2..."
pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs

echo "==> Done. API running on port 3001."
pm2 status
