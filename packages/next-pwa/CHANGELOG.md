# @ducanh2912/next-pwa

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
