---
"@ducanh2912/next-pwa": patch
---

fix(next-pwa): fixed `__PWA_SW_ENTRY_WORKER__` being undefined

- This happens when `cacheOnFrontEndNav` is not enabled, which causes `webpack.DefinePlugin` to not be called.
