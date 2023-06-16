import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { CleanWebpackPlugin } from "clean-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import { logger } from "utils";
import webpack from "webpack";

import swcRc from "./.swcrc.json";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const require = createRequire(import.meta.url);

export const buildSWEntryWorker = ({
  id,
  destDir,
  minify,
  shouldGenSWEWorker,
}: {
  id: string;
  destDir: string;
  minify: boolean;
  shouldGenSWEWorker: boolean;
}) => {
  if (!shouldGenSWEWorker) {
    return undefined;
  }
  const name = `sw-entry-worker-${id}.js`;
  const swEntryWorkerEntry = path.join(__dirname, `sw-entry-worker.js`);

  webpack({
    mode: minify ? "production" : "development",
    target: "webworker",
    entry: {
      main: swEntryWorkerEntry,
    },
    resolve: {
      extensions: [".ts", ".js"],
      fallback: {
        module: false,
        dgram: false,
        dns: false,
        path: false,
        fs: false,
        os: false,
        crypto: false,
        stream: false,
        http2: false,
        net: false,
        tls: false,
        zlib: false,
        child_process: false,
      },
    },
    resolveLoader: {
      alias: {
        "swc-loader": require.resolve("swc-loader"),
      },
    },
    module: {
      rules: [
        {
          test: /\.(t|j)s$/i,
          use: [
            {
              loader: "swc-loader",
              options: swcRc,
            },
          ],
        },
      ],
    },
    output: {
      path: destDir,
      filename: name,
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [
          path.join(destDir, "sw-entry-worker-*.js"),
          path.join(destDir, "sw-entry-worker-*.js.map"),
        ],
      }),
    ],
    optimization: minify
      ? {
          minimize: true,
          minimizer: [new TerserPlugin()],
        }
      : undefined,
  }).run((error, status) => {
    if (error || status?.hasErrors()) {
      logger.error(`Failed to build sw-entry's worker.`);
      logger.error(status?.toString({ colors: true }));
      process.exit(-1);
    }
  });

  return `/${name}`;
};
