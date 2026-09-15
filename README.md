This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy

Static export — served by Nginx, no Node.js at runtime. `pnpm build` reads
`.env.production` (`NEXT_PUBLIC_API_URL=https://apis3.millerrivera.com`) and
writes the site to `out/`.

```bash
pnpm build
# upload out/ to the server, e.g.:
rsync -avz --delete out/ user@host:/var/www/apps/web/frontend_s3/out/
```

Nginx (root points at `out/`; `trailingSlash: true` means every route is a
folder with its own `index.html`, so no per-route rewrite is needed):

```nginx
server {
  listen 80;
  server_name panel.example.com;

  root /var/www/apps/web/frontend_s3/out;

  location / {
    try_files $uri $uri/ =404;
  }

  error_page 404 /404.html;
  location = /404.html {
    internal;
  }
}
```
