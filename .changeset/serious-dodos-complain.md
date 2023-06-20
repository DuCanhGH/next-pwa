---
"@ducanh2912/next-pwa": major
---

BREAKING CHANGE(requirements): bump minimum Next.js version to v11

What: `next-pwa`'s minimum supported Next.js version is now 11.0.0.

Why: I noticed that `workbox-webpack-plugin` no longer works with Next.js 9 and 10, so this bumps the minimum supported Next.js version to v11.

How to upgrade: Bump `next` to at least 11.0.0.
