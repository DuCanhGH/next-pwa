// @ts-check
/**
 * @typedef {Pick<
 *   import("rollup").RollupOptions,
 *   "input" | "output" | "external" | "plugins"
 * >} FileEntry
 */
import { swcConfig } from "@ducanh2912/constants/swc-config";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";

const isDev = process.env.NODE_ENV !== "production";
const shouldEmitDeclaration = !isDev;

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
    // chalk should be bundled with the package to work with CJS.
    external: ["clean-webpack-plugin", "terser-webpack-plugin", "semver"],
  },
  {
    input: "src/build/generate-sw/base-sw.ts",
    output: {
      file: "dist/base-sw.js",
      format: "esm",
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
    input: "src/swc-loader.ts",
    output: {
      file: "dist/swc-loader.cjs",
      format: "cjs",
    },
    external: ["semver"],
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
          extensions: [".js", ".ts"],
        }),
        json(),
        shouldEmitDeclaration &&
          typescript({
            noForceEmit: true,
            outDir: "dist",
            declaration: true,
            declarationDir: "dts",
            noEmit: false,
          }),
        swc({
          swc: {
            ...swcConfig,
            minify: !isDev,
          },
        }),
        ...[plugins ?? []],
      ],
    })
  );
}

if (shouldEmitDeclaration) {
  /** @type {FileEntry[]} */
  const declarations = [
    {
      input: "dist/dts/index.d.ts",
      output: [
        { format: "es", file: "dist/index.module.d.ts" },
        { format: "cjs", file: "dist/index.d.cts" },
      ],
    },
  ];
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
}

export default rollupEntries;
