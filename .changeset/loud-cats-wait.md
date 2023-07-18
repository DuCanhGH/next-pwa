---
"@ducanh2912/next-pwa": minor
---

chore: revert adding `webpack` to `dependencies`

- This version reverts that now that Next 13.4.10 has been released, which fixes the issue in which `workbox-webpack-plugin` fails to resolve `webpack` in
  development mode.

- **Note**: If you are using Next 13.4.9, you will need to install `webpack` as a `devDependency` to avoid the aforementioned issue. This is quite a breaking
  change, but it is due to a bug and I've decided against making a major jump. It is recommended to just upgrade to Next 13.4.10 (and still have `webpack` installed, as it is one of our `peerDependencies`).
