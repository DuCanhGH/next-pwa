# @ducanh2912/next-pwa

## 10.2.0

### Minor Changes

- [`f65e6ab`](https://github.com/DuCanhGH/next-pwa/commit/f65e6aba279619c2bfb86ed28fe8bf966f6ce11e) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - refactor(core): create a context

  - We now leverage a context to share the user's options for Webpack, Next.js, `next-pwa`, TypeScript, etc. across the codebase. This is better than the old approach, which was similar to props drilling, in that it is more readable and less error-prone.
    - I'd like to extend my thanks to the `vite-pwa` team for this approach! Learned a lot through forking `vite-plugin-pwa`, that's for sure.
  - Additionally, the codebase now leverages Biome.js instead of Prettier and ESLint. For now, pre-commit hooks using Husky are not available.

## 10.1.0

### Minor Changes

- [#130](https://github.com/DuCanhGH/next-pwa/pull/130) [`9ff6c29`](https://github.com/DuCanhGH/next-pwa/commit/9ff6c29352cb24f17654e2447f2e547c4243e146) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - feat(next-pwa): re-adjust `workboxOptions.exclude` defaults

  - This was long overdue, so here we are.
  - Why?
    - This proves to be more sensible than the old defaults.
  - Would this incur a breaking change?
    - Technically yes according to my definitions of a breaking change. It will cause a behavioural change in the built app, unexpectedly so for those who don't pinpoint their dependencies' versions. However, I don't believe this has an impact big enough. This... simply improves the user experience, and it won't cause any build to suddenly fail.

## 10.0.2

### Patch Changes

- [`9107baa`](https://github.com/DuCanhGH/next-pwa/commit/9107baa56c8609e6d0d6068721a6f654f0755b14) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(cofen): fixed type errors

## 10.0.1

### Patch Changes

- [#127](https://github.com/DuCanhGH/next-pwa/pull/127) [`a4b8926`](https://github.com/DuCanhGH/next-pwa/commit/a4b8926b0e4158f7194db38c59f097280d07c324) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(cache-on-front-end-nav): fixed error 'URL object could not be cloned.'

  - This was due to us trying to send the URL object to our worker through `postMessage`.

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
