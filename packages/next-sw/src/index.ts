import path from "node:path";

import { logger } from "@ducanh2912/utils";
import type { NextConfig } from "next";
import type { Configuration, default as Webpack } from "webpack";

import { getDefaultDocumentPage } from "./build/generate-sw/core-utils.js";
import { DEFAULT_RUNTIME_CACHING } from "./build/generate-sw/default-runtime-caching.js";
import { GenerateSW } from "./build/generate-sw/index.js";
import type { PluginOptions, RuntimeCaching } from "./types.js";

let warnedAboutDev = false;

const withPWAInit = (
  pluginOptions: PluginOptions = {}
): ((_?: NextConfig) => NextConfig) => {
  return (nextConfig = {}) => ({
    ...nextConfig,
    ...{
      webpack(config: Configuration, context) {
        const isAppDirEnabled = !!nextConfig.experimental?.appDir;
        const {
          buildId,
          dev,
          config: { pageExtensions = ["tsx", "ts", "jsx", "js", "mdx"] },
        } = context;

        const webpack: typeof Webpack = context.webpack;

        let basePath = context.config.basePath;

        // basePath can be an empty string.
        if (!basePath) {
          basePath = "/";
        }

        const {
          dest = "public",
          disable = false,
          exclude,
          fallbackRoutes = {},
          importScripts = [],
          include,
          logging = dev,
          skipWaiting = true,
          register = true,
          runtimeCaching: providedRuntimeCaching,
        } = pluginOptions;

        if (typeof nextConfig.webpack === "function") {
          config = nextConfig.webpack(config, context);
        }

        if (disable) {
          context.isServer && logger.event("PWA support is disabled.");
          return config;
        }

        logger.event(
          `Compiling for ${context.isServer ? "server" : "client (static)"}...`
        );

        if (!config.plugins) {
          config.plugins = [];
        }

        config.plugins.push(
          new webpack.DefinePlugin({
            __PWA_ENABLE_REGISTER__: register.toString(),
            __PWA_ENABLE_LOGGING__: logging.toString(),
          })
        );

        const swEntryJs = path.join(__dirname, "sw-entry.js");
        const entry = config.entry as () => Promise<
          Record<string, string[] | string>
        >;
        config.entry = () =>
          entry().then((entries) => {
            if (entries["main.js"] && !entries["main.js"].includes(swEntryJs)) {
              if (Array.isArray(entries["main.js"])) {
                entries["main.js"].unshift(swEntryJs);
              } else if (typeof entries["main.js"] === "string") {
                entries["main.js"] = [swEntryJs, entries["main.js"]];
              }
            }
            if (
              entries["main-app"] &&
              !entries["main-app"].includes(swEntryJs)
            ) {
              if (Array.isArray(entries["main-app"])) {
                entries["main-app"].unshift(swEntryJs);
              } else if (typeof entries["main-app"] === "string") {
                entries["main-app"] = [swEntryJs, entries["main-app"]];
              }
            }
            return entries;
          });

        if (!context.isServer) {
          if (dev && !warnedAboutDev) {
            logger.info(
              "Building in development mode. Caching and precaching are mostly disabled, but you can continue developing other functions in the service worker."
            );
            warnedAboutDev = true;
          }
          const resolvedDest = path.join(context.dir, dest);

          if (!fallbackRoutes.document) {
            fallbackRoutes.document = getDefaultDocumentPage(
              context.dir,
              pageExtensions,
              isAppDirEnabled
            );
          }

          const runtimeCaching: RuntimeCaching[] = [];
          const runtimeCachingKeys = new Set<string>();

          const addEntryToRuntimeCaching = (entry: RuntimeCaching) => {
            const cacheName = entry.options?.cacheName;
            if (cacheName && runtimeCachingKeys.has(cacheName)) {
              return;
            }

            if (cacheName) {
              runtimeCachingKeys.add(cacheName);
            }

            // provide default values here.
            if (!entry.method) {
              entry.method = "GET";
            }

            runtimeCaching.push(entry);
          };

          if (providedRuntimeCaching) {
            for (const entry of providedRuntimeCaching) {
              addEntryToRuntimeCaching(entry);
            }
          }

          for (const entry of DEFAULT_RUNTIME_CACHING) {
            addEntryToRuntimeCaching(entry);
          }

          config.plugins.push(
            new GenerateSW({
              id: buildId,
              baseDir: context.dir,
              destDir: resolvedDest,
              exclude,
              fallbackRoutes,
              importScripts,
              include,
              isAppDirEnabled,
              minify: !dev,
              pageExtensions,
              skipWaiting,
              runtimeCaching,
            })
          );
        }

        return config;
      },
    },
  });
};

export default withPWAInit;
export { DEFAULT_RUNTIME_CACHING as defaultRuntimeCaching };
export * from "./types.js";
