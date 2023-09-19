---
"@ducanh2912/next-pwa": minor
---

feat: added `.webm` to `defaultCache`'s `static-video-assets`

- I think it'd be nice to support this extension as well, and this shouldn't cause a breaking change (if there is another entry that matches `.webm` files in `workboxOptions.runtimeCaching` and `extendDefaultRuntimeCaching`, then Workbox will still pick that entry).
