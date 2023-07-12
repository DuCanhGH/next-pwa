---
"@ducanh2912/next-pwa": patch
---

chore(deps): updated dependencies, moved webpack to "dependencies"

- `webpack` is now a dependency rather than a peer dependency.
- Reverted the change where we replaced `webpack` with Next's `webpack` instance.
