#!/bin/bash
# test-sync.sh
# Test sync với local/remote D1

# Đọc token từ .env.local
TOKEN=$(grep ADMIN_SYNC_TOKEN .env.local | cut -d '=' -f2)

if [ -z "$TOKEN" ]; then
  echo "❌ Không tìm thấy ADMIN_SYNC_TOKEN trong .env.local"
  exit 1
fi

# Default: local dev server với wrangler
HOST=${1:-"http://localhost:8788"}
SOURCE=${2:-"ophim"}
LIMIT=${3:-"5"}

echo "🎬 Testing sync..."
echo "   Host: $HOST"
echo "   Source: $SOURCE"
echo "   Limit: $LIMIT"
echo ""

curl -X POST "$HOST/api/admin/sync?source=$SOURCE&token=$TOKEN&limit=$LIMIT" | jq .
