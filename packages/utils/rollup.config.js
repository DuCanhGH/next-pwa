// @ts-check
/**
 * @typedef {Pick<
 *   import("rollup").RollupOptions,
 *   "input" | "output" | "external" | "plugins"
 * >} FileEntry
 */
import nodeResolve from "@rollup/plugin-node-resolve";
import swc from "@rollup/plugin-swc";
import { swcConfig } from "constants/swc-config";
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
    external: ["semver", "chalk"],
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
