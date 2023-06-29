---
"@ducanh2912/next-pwa": patch
---

fix(next-pwa): fixed `next-pwa` not being minified properly

- This is due to the change done in 9.1.0. I forgot to configure `jsc.minify`, so `next-pwa` is minified using the default options.
