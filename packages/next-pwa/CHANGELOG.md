# @ducanh2912/next-pwa

## 9.2.1

### Patch Changes

- [#55](https://github.com/DuCanhGH/next-pwa/pull/55) [`c8523d5`](https://github.com/DuCanhGH/next-pwa/commit/c8523d56b640ce86ba5bf468b1716b42a538b09e) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - chore(deps): updated dependencies, moved webpack to "dependencies"

  - `webpack` is now a dependency rather than a peer dependency.
  - Reverted the change where we replaced `webpack` with Next's `webpack` instance.

## 9.2.0

### Minor Changes

- [#53](https://github.com/DuCanhGH/next-pwa/pull/53) [`165f4c3`](https://github.com/DuCanhGH/next-pwa/commit/165f4c398ae5f58e6586501db778a0a0ca8ade2c) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - feat: use Next's webpack instead of importing a new one

  - `next-pwa` should now use Next's webpack instance to avoid having multiple webpack copies.

## 9.1.4

### Patch Changes

- [#49](https://github.com/DuCanhGH/next-pwa/pull/49) [`b53cf03`](https://github.com/DuCanhGH/next-pwa/commit/b53cf034bbc6013ac94ebbb63bc88b633ff51102) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(next-pwa): fixed build crashing when swcMinify is set to false

## 9.1.3

### Patch Changes

- [`4d13948`](https://github.com/DuCanhGH/next-pwa/commit/4d13948375d144a89bed858d36aee561bc987ca4) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(next-pwa): fixed swc-minify crashing build when all swc sources can't be resolved

  - The new behaviour should now be using `terser-webpack-plugin`'s `terserMinify` when they can't be found.

## 9.1.2

### Patch Changes

- [`33282e1`](https://github.com/DuCanhGH/next-pwa/commit/33282e1fb59a66a1e91af1679d1dae9c2b388645) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(next-pwa): fixed `@swc/core` not found

  - This is due to our change to `terser-webpack-plugin`'s `TerserPlugin.swcMinify`, which tries to resolve `@swc/core`. It is not installed by default in our case.

## 9.1.1

### Patch Changes

- [#44](https://github.com/DuCanhGH/next-pwa/pull/44) [`8feffa0`](https://github.com/DuCanhGH/next-pwa/commit/8feffa0073ccf0a50a290ebe111953078b8877a6) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(next-pwa): fixed `next-pwa` not being minified properly

  - This is due to the change done in 9.1.0. I forgot to configure `jsc.minify`, so `next-pwa` is minified using the default options.

## 9.1.0

### Minor Changes

- [`0178390`](https://github.com/DuCanhGH/next-pwa/commit/0178390cea97bcbae31bf9ae9da587b93b0e97e5) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - feat(next-pwa): minify custom workers, sw-entry's workers and fallback workers using swc

  - `next-pwa` should now use swc instead of terser to minify these.

## 9.0.1

### Patch Changes

- [`8cb59af`](https://github.com/DuCanhGH/next-pwa/commit/8cb59afd18d057708adb364623101b4a7cf78cf9) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(swc-loader): only log when both swc sources can't be resolved

  - Previously, swc-loader used to always log "Using @swc/core to compile next-pwa's features. Please install it if you haven't." if `next/dist/build/swc` can't be resolved. This can get annoying, so this changes it so that it only logs when both sources can't be resolved.

- [`8cb59af`](https://github.com/DuCanhGH/next-pwa/commit/8cb59afd18d057708adb364623101b4a7cf78cf9) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - chore(next-pwa): removed `app/_offline/page.js` auto-detect for offline fallbacks

  - A part of `v9`'s breaking changes.

## 9.0.0

### Major Changes

- [#38](https://github.com/DuCanhGH/next-pwa/pull/38) [`7bd3ba7`](https://github.com/DuCanhGH/next-pwa/commit/7bd3ba7023f5088a1e8bd7a8779cb99cd2bf369d) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - BREAKING CHANGE(next-pwa, next-sw): use next's swc bindings instead of swc/core

  What: From now on we will try to resolve `next/dist/build/swc` in `swc-loader` (needed to use `cacheOnFrontEndNav`, custom workers and offline fallbacks). If it can't be resolved, we will fallback to `@swc/core` (needed to be installed manually).

  Why: This is to save disk space (we don't need two `@swc/core`) and avoid exceeding Vercel's serverless size limit.

  Why use Next's `next/dist/build/swc`: it seems that `@next/mdx` is also doing the same for their `mdx` Rust compiler.

  How to upgrade: Usually you don't need to do anything. But if you see this line when you build your Next app: `Using @swc/core to compile next-pwa's features. Please install it if you haven't.`, please do as instructed.

- [#38](https://github.com/DuCanhGH/next-pwa/pull/38) [`7bd3ba7`](https://github.com/DuCanhGH/next-pwa/commit/7bd3ba7023f5088a1e8bd7a8779cb99cd2bf369d) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - BREAKING CHANGE(requirements): bump minimum Next.js version to v11

  What: `next-pwa`'s minimum supported Next.js version is now 11.0.0.

  Why: I noticed that `workbox-webpack-plugin` no longer works with Next.js 9 and 10, so this bumps the minimum supported Next.js version to v11.

  How to upgrade: Bump `next` to at least 11.0.0.

## 8.7.1

### Patch Changes

- [#34](https://github.com/DuCanhGH/next-pwa/pull/34) [`9850306`](https://github.com/DuCanhGH/next-pwa/commit/9850306b8864de0b09ea6573904369237d48b6ab) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - fix(next-pwa): fixed `__PWA_SW_ENTRY_WORKER__` being undefined

  - This happens when `cacheOnFrontEndNav` is not enabled, which causes `webpack.DefinePlugin` to not be called.

## 8.7.0

### Minor Changes

- [`fa08192`](https://github.com/DuCanhGH/next-pwa/commit/fa08192ef4bf993f6ed80cf392ab6cefe9eb366d) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - feat(next-pwa, experimental): aggressiveFrontEndNavCaching

  - This feature, combined with `cacheFrontEndNav`, will cache `<link rel="stylesheet" href="" />` and `<script src="" />` on frontend navigation. This allows
    pages which have only been visited through that method to work offline when directly visited.

  - Frontend navigation caching has also been offloaded to a separate worker with this feature.

## 8.6.0

### Minor Changes

- b9dff21: chore(deps): updated workbox to v7

  - This version updates workbox to v7 and other dependencies to latest. It's nice to see that workbox is finally maintained again :)

### Patch Changes

- b9dff21: feat: documentation

  - Added a new docs website and replaced links.

## 8.5.1

### Patch Changes

- 9045662: fix(next-pwa,compatibility): remove `node:` protocol from imports

  - We currently don't have a clear version requirement for Node.js, and as such we should support as many versions as possible. It seems that only Node.js 16 and later support `node:` protocol imports for CJS, so we remove this protocol by using `@rollup/plugin-alias`. This compatibility patch might be removed in the future though.

## 8.5.0

### Minor Changes

- 286f347: feat(next-pwa): better offline support for `app`

  - This update helps improve offline support for App Router by caching RSC prefetches separately from other RSC requests.

- 286f347: feat(next-pwa): added support for extending the default `runtimeCaching` array

  - To use this feature you can add `extendDefaultRuntimeCaching` to your configuration.

  - This feature helps you easily extend the default `runtimeCaching` array without having to copy the whole thing to your config. Your `runtimeCaching` have priority over the default runtime caching array, so its entries will override the default `runtimeCaching`'s entries should any of them share `cacheName`.

## 8.4.1

### Patch Changes

- 5c37579: fix(next-pwa): removed ignoreVary for pages-rsc

## 8.4.0

### Minor Changes

- 6f73e23: Feat: change logging style based on Next's version

## 8.3.0

### Minor Changes

- 537566f: chore(deps): monthly dependencies maintenance
- 537566f: feat(logging): use chalk with console.log

  - Log with `info  -`, `warn  -`, `error -`, `wait  -` to match Next's style of logging.

  - chalk is bundled with the package so there shouldn't be any compatibility issue.

## 8.2.0

### Minor Changes

- 8421d6d: feat(fallbackRoutes): enable the fallback worker when `app/~offline/page.js` is found

  - This also adds a warning about Next.js appDir ignoring folders prefixed by underscore and suggests migrating to /~offline when /\_offline is found.

## 8.1.1

### Patch Changes

- 7e5a838: refactor(core): use .swcrc instead of Next's webpack.config.resolve for path aliases.

## 8.1.0

### Minor Changes

- 172eebf: feat(deps): `next-pwa` no longer requires `swc-loader` to be manually installed

  - This package now installs `swc-loader` on its own, and then resolve it using `require.resolve`.

- 172eebf: chore(docs): isolated parts of README.md into SETUP.md for better docs maintenance

  - I found scrolling through README.md to be quite a pain, so I've isolated parts of it into a new file again.

### Patch Changes

- 172eebf: chore(deps): monthly dependencies maintenance

  - Though I've been quite busy recently with Next.js itself (tons of typedRoutes PRs) and my own stuff, I've promised to always perform a monthly dependencies maintenance.

  - `examples/basic` has migrated from `<head />` to metadata with this.

## 8.0.0

### Major Changes

- 73a4f26: BREAKING CHANGE(typescript): renamed Fallbacks to FallbackRoutes, /register to /workbox.

  - Some JSDoc has also been added to FallbackRoutes.

  - Changing /register to /workbox should have minimal impact, you only need to change `"@ducanh2912/next-pwa/register"` in `compilerOptions.types` to `"@ducanh2912/next-pwa/worker"`

  BREAKING CHANGE(PluginOptions): removed `PluginOptions.exclude`.

  - You should use `PluginOptions.buildExcludes` instead. It is almost the same as `PluginOptions.exclude`, except for the fact that it doesn't override the plugin's `exclude` function, which is used to exclude files that shouldn't/can't be precached.

  style(code): renamed `register.ts` to `sw-entry.ts`.

  - I think this name conveys the meaning of the file better, as it doesn't only register the SW but also handles some of the plugin's features.

  **NOTES**: How to upgrade:

  - Change `"@ducanh2912/next-pwa/register"` in your `tsconfig.json`'s `compilerOptions.types` to `"@ducanh2912/next-pwa/worker"`.

  - Change `exclude` to `buildExcludes` like so:

  ```js
  import withPWAInit from "@ducanh2912/next-pwa";

  const withPWA = withPWAInit({
    // your other options,
    exclude: [],
  });

  export default withPWA({
    // your Next config
  });
  ```

  to

  ```js
  import withPWAInit from "@ducanh2912/next-pwa";

  const withPWA = withPWAInit({
    // your other options,
    buildExcludes: [],
  });

  export default withPWA({
    // your Next config
  });
  ```

  - If you have used the interface `Fallbacks` somewhere in your code, just change it to `FallbackRoutes`.

### Minor Changes

- 0646231: feat(core): support for path aliases in custom worker

  - This does it by copying Next.js's `webpackConfig.resolve` into custom worker's Webpack config.

### Patch Changes

- 4172cd0: chore(deps, code): updated all deps, cleaned up some code, removed subdomainPrefix.

  - This will remove subdomainPrefix from types.ts, but it will only trigger TS if you still have that option, because it stopped doing anything ages ago.

  - Cleaned up some code while I was finding a way to better support offline.

## 7.3.3

### Patch Changes

- ecc1fe7: fix(core): fixed user's webpack config being overridden if the plugin is disabled

  - Before this patch, the plugin used to override user-defined or other plugins' Webpack custom config because it early returned the config (without calling `nextConfig.webpack?.()`) if it was disabled. This fixes it by calling `nextConfig.webpack?.()` before doing anything else.

  chore(types): changed `compilerOptions.moduleResolution` to `"nodeNext"`.

  - This shouldn't impact users. It is only meant to force me to write `.js` at the end of import paths and stuff.

  docs(README): refined main README.md

  - Rewrote README.md to fix grammar issues and decouple tips into TIPS.md. I also fixed/removed some broken links.

  chore(deps): ran deps:update-all

  - Nothing too special...

## 7.3.2

### Patch Changes

- 1bcc70c: docs(types.ts): fixed links, added example for `PluginOptions.register`, `PluginOptions.buildExcludes`.

  - This patch add an example of registering the SW on your own with `register: false` and an example of how `buildExcludes` should look like.
  - It also removed an invalid link (which led to Github's 404 page) and an old link (which led to a deprecated example).

  chore(deps): ran deps:update-all.

  - To clarify the previous patch's message, this is meant to be done at least once a month, but it can be done anytime.

  style(code): cleaned up index.ts.

  - Replaced `_fallbacks` with `hasFallbacks` as copying `pluginOptions.fallbacks` just to indicate that the user did use this feature wasn't really necessary, and can be simplified to using a boolean.

## 7.3.1

### Patch Changes

- 8274a95:

  fix(deps): moved swc-loader to `devDependencies` and `peerDependencies`, added note that reminds users to install swc-loader when using fallbacks and custom worker in `PluginOptions`.

  - swc-loader being in `dependencies` didn't do anything as webpack wants it declared in the user's `package.json`, so I moved it to `devDependencies` and added it to `peerDependencies` (optional).

  docs(README): fixed example `create-next-app` command (added --example flag).

  - Before this change it wasn't a really valid command; while `create-next-app` does run, it will crash on trying to create a `https://github.com/DuCanhGH/next-pwa/tree/master/examples/basic` folder.

  chore(lockfile): moved to pnpm-lock.yaml's v6 format.

  - This doesn't change anything, I just think it is nice to migrate as it will become the default anyway.

## 7.3.0

### Minor Changes

- f224625: feat(core): added support for /\_offline page in appDir.

  - With this version, app/\_offline/page.tsx will automatically enable the fallback worker just like pages/\_offline.tsx.

  chore(deps): updated all dependencies

  - This version also bumps every dependency to their latest versions. This process is done monthly.

## 7.2.0

### Minor Changes

- b6f10be:

  refactor(core): replaced babel with swc.

  - This version replaces babel-loader with swc-loader when building fallback workers and custom workers so that we don't have to use the old `next/babel` anymore.

  - There should be no changes needed except for deleting babel-loader and @babel/core from your `devDependencies` if you don't need them anymore, because this package doesn't.

  refactor(examples): converted every example to Typescript, renamed some, deprecated some.

## 7.1.1

### Patch Changes

- 360c94a: Fix @ducanh2912/next-pwa not having a README.md on npm

## 7.1.0

### Minor Changes

- eb04bce: I refactored the repo into a monorepo one to make it easy to update examples without having to use examples/\_\_examples_utils.
