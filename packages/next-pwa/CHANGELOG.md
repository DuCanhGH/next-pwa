# @ducanh2912/next-pwa

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
