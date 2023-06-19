// @ts-check
/**
 * @typedef {Pick<
 *   import("rollup").RollupOptions,
 *   "input" | "output" | "external" | "plugins"
 * >} FileEntry
 */
import alias from "@rollup/plugin-alias";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";

const isDev = process.env.NODE_ENV !== "production";

/** @type {FileEntry[]} */
const files = [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.cjs",
        format: "cjs",
        exports: "named",
      },
      {
        file: "dist/index.module.js",
        format: "esm",
      },
    ],
    external: [
      "next",
      "semver",
      "clean-webpack-plugin",
      "terser-webpack-plugin",
      "workbox-webpack-plugin",
      "typescript",
      "webpack",
      "crypto",
      "fs",
      "path",
      "url",
      "fast-glob",
      "workbox-window",
    ],
  },
  {
    input: "src/fallback.ts",
    output: {
      file: "dist/fallback.js",
      format: "cjs",
    },
  },
  {
    input: "src/sw-entry.ts",
    output: {
      file: "dist/sw-entry.js",
      format: "esm",
    },
    external: ["workbox-window"],
  },
  {
    input: "src/sw-entry-worker.ts",
    output: {
      file: "dist/sw-entry-worker.js",
      format: "esm",
    },
  },
  {
    input: "src/swc-loader.ts",
    output: {
      file: "dist/swc-loader.cjs",
      format: "cjs",
    },
    external: ["semver"],
  },
];

/** @type {FileEntry[]} */
const declarations = [
  {
    input: "dist/dts/index.d.ts",
    output: [
      { format: "es", file: "dist/index.module.d.ts" },
      { format: "cjs", file: "dist/index.d.cts" },
    ],
  },
  {
    input: "dist/dts/sw-entry.d.ts",
    output: [
      { format: "es", file: "dist/sw-entry.module.d.ts" },
      { format: "cjs", file: "dist/sw-entry.d.cts" },
    ],
  },
];

/**
 * @type {import("rollup").RollupOptions[]}
 */
const rollupEntries = [];

for (const { input, output, external, plugins } of files) {
  rollupEntries.push(
    defineConfig({
      input,
      output,
      external,
      plugins: [
        nodeResolve({
          exportConditions: ["node"],
          preferBuiltins: true,
        }),
        // ensure compatibility by removing `node:` protocol (this MUST
        // exclude "node: protocol"-only core modules such as `node:test`).
        alias({
          entries: [{ find: /node:(?!test)(.*)$/, replacement: "$1" }],
        }),
        typescript({
          noForceEmit: true,
          noEmitOnError: !isDev,
          outDir: "dist",
          declaration: true,
          declarationDir: "dts",
          noEmit: false,
        }),
        json(),
        ...[process.env.NODE_ENV === "production" ? [terser()] : []],
        ...[plugins ?? []],
      ],
    })
  );
}

for (const { input, output, external, plugins } of declarations) {
  rollupEntries.push(
    defineConfig({
      input,
      output,
      external,
      plugins: [dts(), ...[plugins ?? []]],
    })
  );
}

export default rollupEntries;
