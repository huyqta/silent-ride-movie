#!/bin/bash
# sync-all.sh
# Sync toàn bộ catalog từ 1 hoặc tất cả nguồn
# Usage:
#   bash sync-all.sh ophim          # sync toàn bộ OPhim (tất cả pages)
#   bash sync-all.sh nguonc         # sync toàn bộ NguonC
#   bash sync-all.sh kkphim         # sync toàn bộ KKPhim
#   bash sync-all.sh all            # sync cả 3 nguồn
#   bash sync-all.sh ophim 5        # sync 5 pages OPhim (batch nhỏ, ~120 phim)

set -e
cd "$(dirname "$0")"

TOKEN=$(grep ADMIN_SYNC_TOKEN .env.local | cut -d '=' -f2 | tr -d '\n\r ')
if [ -z "$TOKEN" ]; then
  echo "❌ ADMIN_SYNC_TOKEN not found in .env.local"
  exit 1
fi

BASE="https://silent-ride-v2.anhhuydng.workers.dev"
SOURCE="${1:-ophim}"
MAX_PAGES="${2:-0}"  # 0 = all pages

echo "================================================"
echo "🎬 Silent Ride Multi-Source Sync"
echo "================================================"
echo "Source  : $SOURCE"
echo "Pages   : ${MAX_PAGES:-all}"
echo "Worker  : $BASE"
echo "================================================"
echo ""

START_TIME=$(date +%s)

RESPONSE=$(curl -s -X POST \
  "$BASE/api/admin/sync?source=$SOURCE&token=$TOKEN&pages=$MAX_PAGES" \
  --max-time 120 \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -1)

END_TIME=$(date +%s)
ELAPSED=$((END_TIME - START_TIME))

echo "Response: $BODY"
echo ""
echo "HTTP Status : $HTTP_CODE"
echo "Total time  : ${ELAPSED}s"
echo ""

# Verify count
echo "📊 Current D1 counts:"
npx wrangler d1 execute silent-ride-movies --remote \
  --command "SELECT source_name, COUNT(*) as count FROM movie_sources GROUP BY source_name" \
  2>/dev/null | grep -E '"source_name"|"count"' | paste - -
echo ""

npx wrangler d1 execute silent-ride-movies --remote \
  --command "SELECT COUNT(*) as total_movies FROM movies" \
  2>/dev/null | grep '"total_movies"'
