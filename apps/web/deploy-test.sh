#!/bin/bash
# deploy-test.sh - Deploy và test sync trên production

set -e

cd "$(dirname "$0")"

echo "📦 Building OpenNext..."
pnpm pages:build

echo ""
echo "🚀 Deploying to Cloudflare Pages..."
npx wrangler pages deploy .open-next --project-name silent-ride

echo ""
echo "✅ Deploy complete!"
echo ""
echo "📝 Next steps:"
echo "1. Set ADMIN_SYNC_TOKEN secret:"
echo "   npx wrangler secret put ADMIN_SYNC_TOKEN"
echo ""
echo "2. Test sync:"
echo "   bash quick-test.sh https://silent-ride.pages.dev ophim 3"
echo ""
echo "3. Verify data:"
echo "   npx wrangler d1 execute silent-ride-movies --remote --command \"SELECT COUNT(*) FROM movies\""
