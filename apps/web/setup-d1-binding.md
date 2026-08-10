# Cách gắn D1 binding cho Pages Project

Wrangler CLI không hỗ trợ add D1 binding cho Pages qua command line. Phải làm thủ công qua Dashboard.

## Bước 1: Mở Dashboard

```
https://dash.cloudflare.com/b75fd379997102b90fad715f9c906d8c/pages/view/silent-ride-v2/settings/functions
```

## Bước 2: Scroll xuống "Bindings" section

- Click **"Add binding"**
- Chọn **D1 database**
- Variable name: `DB`
- D1 database: `silent-ride-movies`
- Click **"Save"**

## Bước 3: Redeploy (bindings chỉ apply sau redeploy)

```bash
cd apps/web
npx wrangler pages deploy .open-next --project-name silent-ride-v2 --branch main --commit-dirty=true
```

## Bước 4: Test sync API

```bash
cd apps/web
bash quick-test.sh https://main.silent-ride-v2.pages.dev ophim 3
```

Expected response:
```json
{
  "success": true,
  "source": "ophim",
  "results": {
    "ophim": 3,
    "errors": []
  },
  "timing": {
    "duration_ms": 2500,
    "limit": 3,
    "page": 1
  }
}
```

## Bước 5: Verify data trong D1

```bash
npx wrangler d1 execute silent-ride-movies --remote \
  --command "SELECT COUNT(*) as total FROM movies"

npx wrangler d1 execute silent-ride-movies --remote \
  --command "SELECT title, year FROM movies ORDER BY updated_at DESC LIMIT 5"
```
