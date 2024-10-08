# @ducanh2912/next-pwa

## 10.2.9

### Patch Changes

- [`f3766a5`](https://github.com/DuCanhGH/next-pwa/commit/f3766a53f924568a51480d0883dd4515994087f1) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - chore(deps): updated all dependencies

  - Monthly dependencies maintenance

  - Not so monthly this time...

## 10.2.8

### Patch Changes

- [`d43ba6c`](https://github.com/DuCanhGH/next-pwa/commit/d43ba6c2cd0ed0df0a03d1d5e0eb6b7a733ee8b7) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - chore(deps): monthly dependencies maintenance

## 10.2.7

### Patch Changes

- [`a1f09b3`](https://github.com/DuCanhGH/next-pwa/commit/a1f09b3eee624cc1cdf0d751731b460d910002bd) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - chore(next-pwa): removed `clean-webpack-plugin`

  - This plugin is... unmaintained, and we could use `fs.rmSync` anyway.

## 10.2.6

### Patch Changes

- 043aa36: chore(misc): migrated to GitLab

  - This also updated the dependencies and revamped how we test things.

## 10.2.5

### Patch Changes

- [`e6ce949`](https://github.com/DuCanhGH/next-pwa/commit/e6ce949366f7fef9f4fdff7c1baf08da25e1268f) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(core): fixed using fallbacks with files in the public directory

  - Silly mistakes... Sorry for the inconvenience.

## 10.2.4

### Patch Changes

- [`07c8861`](https://github.com/DuCanhGH/next-pwa/commit/07c886159faafc691645c30ad0917f19069d8c6a) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(core): fixed invalid precache manifest with `assetPrefix`

  - Turns out it is much more complex than we thought. To make this work with `assetPrefix`, `distDir`, and `basePath`, we now remove `${publicPath}${publicDirRelativeToOutputPath}` from public files in `manifestTransforms` because `assetPrefix` is not intended for files that are in the public directory and we also want to remove `/_next/${publicDirRelativeToOutputPath}` from the URL, since that is not how we resolve files in the public directory.

## 10.2.3

### Patch Changes

- [`e5f1d14`](https://github.com/DuCanhGH/next-pwa/commit/e5f1d14828d669e17e694e0a18bcfb2f8231a6b9) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(core): fixed invalid precache manifest and scope with `basePath`

  - A fast backport of https://github.com/serwist/serwist/pull/56.
  - This is caused by "/\_next/../public" in modifyURLPrefix not being matched when basePath is set, since the URL is actually "${basePath}/\_next/../public/\*\*/\*". We now use `manifestTransforms` instead of `modifyURLPrefix`.
  - Also, with the refactor to using a context, we mistakenly changed `scope` from "${scope}" (suffixed with / if originally not) to "${basePath}/${scope}". This reverts that change. Sorry for the inconvenience!

## 10.2.2

### Patch Changes

- [`e583be6`](https://github.com/DuCanhGH/next-pwa/commit/e583be60114cb5e0b85adbe50ae608a2665a5d13) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(disable): fixed `disable` not working properly

  - In 10.2.0 and 10.2.1, when `disable` was set, certain unexpected parts were still processed, causing the resulting app to contain some erroneous JavaScript.
  - This has been fixed in 10.2.2. Although we still run `parseOptions`, we only do so to get the default options.

## 10.2.1

### Patch Changes

- [`aeb0dc9`](https://github.com/DuCanhGH/next-pwa/commit/aeb0dc998ce3fbd350e90aad2e534d70f98abc4c) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(mjs): fixed the ESM build crashing

  - This was due to us referencing `__dirname`, which was `undefined` in the ESM build...

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
