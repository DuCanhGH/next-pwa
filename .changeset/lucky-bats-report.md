---
"@ducanh2912/next-pwa": patch
---

fix: remove `lazy` and `importInterop` from `.swcrc`

- Seems that these values are no longer allowed with `module.type` set to `"es6"` or `"nodenext"`.
