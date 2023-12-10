# @ducanh2912/next-pwa

## 10.0.0

### Major Changes

- [`52d2390`](https://github.com/DuCanhGH/next-pwa/commit/52d23902cf674345e47d68b85fc0a206d079bf63) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - chore(backporting): backported some changes from `@serwist/next@8.0.0`

  - Removed `buildExcludes`.
    - Simply use `workboxOptions.exclude` as a replacement.
  - Removed `customWorkerDir`.
    - Use `customWorkerSrc` instead.
  - Removed `browserslist`, `swcMinify`, `watchWorkersInDev`.
    - We now create child compilers on Next.js's compiler instead of starting separate Webpack processes.
    - This also means you don't need to have `@swc/core` installed anymore.
  - Change the default value for `dest` from `".next"` to `"public"`.
    - You should change it to `".next"` in your project if there's demand, but I'd recommend using `"public"` instead.
  - Fixed the custom worker and the fallback worker not working...
    - I'm seriously sorry... This was caused by `next-pwa`'s `importScripts` not being passed to Workbox.
  - Moved the minimum supported Next.js version from 11.0.0 to 14.0.0.
    - This is to remove the appDir check.

### Patch Changes

- [#115](https://github.com/DuCanhGH/next-pwa/pull/115) [`974326e`](https://github.com/DuCanhGH/next-pwa/commit/974326eb21b31b550b0d5b663cc35a2ebc19344c) Thanks [@vlad-yakovlev](https://github.com/vlad-yakovlev)! - fix(next-auth): allow users to use the application offline
