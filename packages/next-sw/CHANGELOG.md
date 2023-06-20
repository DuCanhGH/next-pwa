# @ducanh2912/next-sw

## 1.1.0

### Minor Changes

- [#38](https://github.com/DuCanhGH/next-pwa/pull/38) [`7bd3ba7`](https://github.com/DuCanhGH/next-pwa/commit/7bd3ba7023f5088a1e8bd7a8779cb99cd2bf369d) Thanks [@DuCanhGH](https://github.com/DuCanhGH)! - BREAKING CHANGE(next-pwa, next-sw): use next's swc bindings instead of swc/core

  What: From now on we will try to resolve `next/dist/build/swc` in `swc-loader` (needed to use `cacheOnFrontEndNav`, custom workers and offline fallbacks). If it can't be resolved, we will fallback to `@swc/core` (needed to be installed manually).

  Why: This is to save disk space (we don't need two `@swc/core`) and avoid exceeding Vercel's serverless size limit.

  Why use Next's `next/dist/build/swc`: it seems that `@next/mdx` is also doing the same for their `mdx` Rust compiler.

  How to upgrade: Usually you don't need to do anything. But if you see this line when you build your Next app: `Using @swc/core to compile next-pwa's features. Please install it if you haven't.`, please do as instructed.

## 1.0.0

### Patch Changes

- f231e39: Add provenance
- 639b6a8: First release for `@ducanh2912/next-sw`!

## 1.0.0-alpha.2

### Patch Changes

- f231e39: Add provenance

## 1.0.0-alpha.1

### Patch Changes

- First release for `@ducanh2912/next-sw`!
