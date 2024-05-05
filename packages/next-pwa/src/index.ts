import fs from "node:fs";
import path from "node:path";

import fg from "fast-glob";
import type { NextConfig } from "next";
import type { Configuration } from "webpack";

import { logger } from "#utils/index.js";

import defaultCache from "./cache.js";
import { createContext } from "./context.js";
import { resolveWorkboxPlugin } from "./resolve-workbox-plugin.js";
import type { PluginOptions } from "./types.js";
import { buildSWEntryWorker } from "./webpack/builders/build-sw-entry-worker.js";

const withPWAInit = (pluginOptions: PluginOptions = {}): ((nextConfig?: NextConfig) => NextConfig) => {
  return (nextConfig = {}) => ({
    ...nextConfig,
    webpack(config: Configuration, options) {
      const ctx = createContext(options.webpack, options, nextConfig, config, pluginOptions);

      if (ctx.disabled) {
        return ctx.webpackConfig;
      }

      if (!ctx.webpackConfig.plugins) {
        ctx.webpackConfig.plugins = [];
      }

      logger.event(`Compiling for ${options.isServer ? "server" : "client (static)"}...`);

      if (!options.isServer) {
        const cleanUpList = [
          ...fg.sync(
            [
              "{workbox,fallback,swe-worker,worker}-*.js",
              "{workbox,fallback,swe-worker,worker}-*.js.map",
              `${ctx.options.swPath.replace(/^\/+/, "")}`,
              `${ctx.options.swPath.replace(/^\/+/, "")}.map`,
            ],
            {
              absolute: true,
              cwd: ctx.options.dest,
            },
          ),
          ...fg.sync([`${ctx.options.customWorkerPrefix}-*.js`, `${ctx.options.customWorkerPrefix}-*.js.map`], {
            absolute: true,
            cwd: ctx.options.customWorkerDest,
          }),
        ];

        for (const file of cleanUpList) {
          fs.rmSync(file, { force: true });
        }

        const sweWorker = buildSWEntryWorker(ctx);

        ctx.webpackConfig.plugins.push(
          new ctx.webpack.DefinePlugin({
            __PWA_SW_ENTRY_WORKER__: sweWorker?.name && `'${sweWorker.name}'`,
          }),
          ...(sweWorker ? [sweWorker.pluginInstance] : []),
        );

        if (!ctx.options.register) {
          logger.info(
            "Service worker won't be automatically registered as per the config, please call the following code in componentDidMount or useEffect:",
          );

          logger.info("  window.workbox.register()");

          if (!ctx.tsConfig?.compilerOptions?.types?.includes("@ducanh2912/next-pwa/workbox")) {
            logger.info("You may also want to add @ducanh2912/next-pwa/workbox to compilerOptions.types in your tsconfig.json/jsconfig.json.");
          }
        }

        logger.info(`Service worker: ${path.join(ctx.options.dest, ctx.options.sw)}`);
        logger.info(`  URL: ${ctx.options.sw}`);
        logger.info(`  Scope: ${ctx.options.scope}`);

        ctx.webpackConfig.plugins.push(...resolveWorkboxPlugin(ctx));
      }

      return ctx.webpackConfig;
    },
  });
};

export default withPWAInit;
export { defaultCache as runtimeCaching };
export * from "./types.js";
