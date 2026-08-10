#!/bin/bash
# Quick test sync without dependencies

cd "$(dirname "$0")"

TOKEN=$(grep ADMIN_SYNC_TOKEN .env.local | cut -d '=' -f2 | tr -d '\n\r ')

if [ -z "$TOKEN" ]; then
  echo "❌ ADMIN_SYNC_TOKEN not found in .env.local"
  exit 1
fi

URL="${1:-https://silent-ride-v2.anhhuydng.workers.dev}/api/admin/sync"
SOURCE="${2:-ophim}"
LIMIT="${3:-3}"

echo "🎯 Testing: $URL"
echo "   Source: $SOURCE"
echo "   Limit: $LIMIT"
echo ""

curl -X POST "${URL}?source=${SOURCE}&token=${TOKEN}&limit=${LIMIT}" \
  -H "Content-Type: application/json" \
  --max-time 30 \
  -w "\n\nStatus: %{http_code}\nTime: %{time_total}s\n"
