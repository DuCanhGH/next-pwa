---
"@ducanh2912/next-pwa": minor
---

refactor: removed `'activated'` event listeners in `sw-entry.ts`

- These listeners seem to be unnecessary as we already have `runtimeCaching`. Though, this is merely an assumption and might cause issues for some people.
  Do open a new issue if you are one of them :)
- This also updates every dependency to their latest versions.
