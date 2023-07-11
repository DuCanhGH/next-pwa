// @ts-check
/**
 * @typedef {Pick<
 *   import("rollup").RollupOptions,
 *   "input" | "output" | "external" | "plugins"
 * >} FileEntry
 */
import { swcConfig } from "@ducanh2912/constants/swc-config";
import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import { defineConfig } from "rollup";

/** @type {FileEntry[]} */
const files = [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        format: "esm",
      },
    ],
    external: ["semver"],
  },
];

export default files.map(({ input, output, external, plugins }) =>
  defineConfig({
    input,
    output,
    external,
    plugins: [
      nodeResolve({
        exportConditions: ["node"],
        extensions: [".js", ".ts"],
      }),
      swc({
        swc: {
          ...swcConfig,
          minify: true,
        },
      }),
      ...[plugins ?? []],
    ],
  })
);
