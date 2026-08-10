#!/bin/bash
# dev-with-d1.sh
# Script để test local với D1 binding

echo "🔨 Building OpenNext..."
pnpm pages:build

echo ""
echo "🚀 Starting dev server with D1 binding..."
echo "📝 Sync endpoint: http://localhost:8788/api/admin/sync"
echo ""

npx wrangler pages dev .open-next \
  --compatibility-date=2024-12-01 \
  --compatibility-flag=nodejs_compat \
  --d1=DB=silent-ride-movies \
  --port=8788
