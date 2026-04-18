# Cloudflare Backend Migration

## Target

- Keep Vercel as the frontend host
- Move the real content backend to Cloudflare Workers
- Store diary and album metadata in D1
- Store uploaded images in R2

## Directory

- Worker code: `cloudflare-backend/`
- D1 schema: `cloudflare-backend/schema.sql`

## One-time setup

1. Login:
   - `npx wrangler login`

2. Create D1:
   - `npx wrangler d1 create ustccb-personal-hub`

3. Create R2 bucket:
   - `npx wrangler r2 bucket create ustccb-personal-images`

4. Update `cloudflare-backend/wrangler.jsonc`:
   - replace `database_id`
   - confirm `bucket_name`

5. Install worker deps:
   - `cd cloudflare-backend`
   - `npm install`

6. Apply schema:
   - `npx wrangler d1 execute ustccb-personal-hub --remote --file=./schema.sql`

7. Deploy worker:
   - `npx wrangler deploy`

## Vercel env

After deploy, set this on the frontend:

- `BACKEND_API_BASE_URL=https://<your-worker-subdomain>.workers.dev`

or

- `NEXT_PUBLIC_BACKEND_API_BASE_URL=https://<your-worker-subdomain>.workers.dev`

Then redeploy Vercel.

## Supported endpoints

- `GET /health`
- `GET /api/diary`
- `POST /api/diary`
- `GET /api/album`
- `POST /api/album`
- `POST /api/album/:id/photos`
- `POST /api/files/upload`
- `GET /files/:key`

## Notes

- Uploaded images are written to R2 and returned as Worker-served URLs.
- The frontend pages already call these routes through the existing Next.js proxy layer.
- `wrangler types` should be run after the Cloudflare resources are created so `worker-configuration.d.ts` reflects the real bindings.
