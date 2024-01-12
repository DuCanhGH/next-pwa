// @ts-check
/**
 * @typedef {Pick<
 *  import("rollup").RollupOptions,
 *  "input" | "output" | "plugins"
 * > & {
 *   external?: (string | RegExp)[] | string | RegExp;
 * }} FileEntry
 */
import alias from "@rollup/plugin-alias";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import dts from "rollup-plugin-dts";

import packageJson from "./package.json" assert { type: "json" };
import { swcConfig } from "./swc-config.js";

const isDev = process.env.NODE_ENV !== "production";
const shouldEmitDeclaration = !isDev;
const forcedExternals = [...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.peerDependencies)];

/** @type {FileEntry[]} */
const files = [
  {
    input: {
      index: "src/index.ts",
      fallback: "src/fallback.ts",
      "sw-entry": "src/sw-entry.ts",
      "sw-entry-worker": "src/sw-entry-worker.ts",
    },
    output: [
      {
        dir: "dist",
        entryFileNames: "[name].cjs",
        chunkFileNames: "[name].cjs",
        format: "cjs",
        exports: "named",
      },
      {
        dir: "dist",
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        format: "esm",
      },
    ],
  },
];

/**
 * @type {import("rollup").RollupOptions[]}
 */
const rollupEntries = [];

for (const { input, output, external = [], plugins } of files) {
  rollupEntries.push(
    defineConfig({
      input,
      output,
      external: [...(Array.isArray(external) ? external : [external]), ...forcedExternals],
      plugins: [
        nodeResolve({
          exportConditions: ["node"],
          preferBuiltins: true,
          extensions: [".js", ".ts"],
        }),
        // ensure compatibility by removing `node:` protocol (this MUST
        // exclude "node: protocol"-only core modules such as `node:test`).
        alias({
          entries: [{ find: /node:(?!test)(.*)$/, replacement: "$1" }],
        }),
        json(),
        shouldEmitDeclaration &&
          typescript({
            noForceEmit: true,
            noEmit: false,
            emitDeclarationOnly: true,
            outDir: "dist",
            declaration: true,
            declarationDir: "dist/dts",
          }),
        swc({
          swc: {
            ...swcConfig,
            minify: !isDev,
          },
        }),
        ...[plugins ?? []],
      ],
    }),
  );
}

if (shouldEmitDeclaration) {
  /** @type {FileEntry[]} */
  const declarations = [
    {
      input: {
        index: "dist/dts/src/index.d.ts",
        "sw-entry": "dist/dts/src/sw-entry.d.ts",
      },
      output: [
        {
          dir: "dist",
          entryFileNames: "[name].d.cts",
          chunkFileNames: "[name].d.cts",
          format: "cjs",
          exports: "named",
        },
        {
          dir: "dist",
          entryFileNames: "[name].d.ts",
          chunkFileNames: "[name].d.ts",
          format: "esm",
        },
      ],
    },
  ];

  for (const { input, output, external = [], plugins } of declarations) {
    rollupEntries.push(
      defineConfig({
        input,
        output,
        external: [...(Array.isArray(external) ? external : [external]), ...forcedExternals],
        plugins: [dts(), ...[plugins ?? []]],
      }),
    );
  }
}

export default rollupEntries;
