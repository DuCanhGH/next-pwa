import path from "node:path";

import { logger } from "@ducanh2912/utils";
import type { RuntimeCaching } from "workbox-build";
import WorkboxPlugin from "workbox-webpack-plugin";

import type { WorkboxTypes } from "./private-types.js";
import { resolveRuntimeCaching } from "./resolve-runtime-caching.js";
import type { WorkboxCommon } from "./resolve-workbox-common.js";
import type { PluginOptions } from "./types.js";
import { isInjectManifestConfig, overrideAfterCalledMethod } from "./utils.js";

type PluginCompleteOptions = Required<
  Pick<PluginOptions, "extendDefaultRuntimeCaching" | "dynamicStartUrl">
>;

export const resolveWorkboxPlugin = ({
  rootDir,
  basePath,
  isDev,

  workboxCommon,
  workboxOptions,
  importScripts,

  extendDefaultRuntimeCaching,
  dynamicStartUrl,

  hasFallbacks,
}: {
  rootDir: string;
  basePath: string;
  isDev: boolean;

  workboxCommon: WorkboxCommon;
  workboxOptions: WorkboxTypes[keyof WorkboxTypes];
  importScripts: string[];

  hasFallbacks: boolean;
} & PluginCompleteOptions) => {
  if (isInjectManifestConfig(workboxOptions)) {
    const swSrc = path.join(rootDir, workboxOptions.swSrc);
    logger.info(`Using InjectManifest with ${swSrc}`);
    const workboxPlugin = new WorkboxPlugin.InjectManifest({
      ...workboxCommon,
      ...workboxOptions,
      swSrc,
    });
    if (isDev) {
      overrideAfterCalledMethod(workboxPlugin);
    }
    return workboxPlugin;
  } else {
    const {
      skipWaiting = true,
      clientsClaim = true,
      cleanupOutdatedCaches = true,
      ignoreURLParametersMatching = [],
      importScripts: userImportScripts,
      runtimeCaching: userRuntimeCaching,
    } = workboxOptions;

    let runtimeCaching: RuntimeCaching[];

    if (userImportScripts) {
      importScripts.push(...userImportScripts);
    }

    let shutWorkboxAfterCalledUp = false;

    if (isDev) {
      logger.info(
        "Building in development mode, caching and precaching are disabled for the most part. This means that offline support is disabled, " +
          "but you can continue developing other functions in service worker."
      );
      ignoreURLParametersMatching.push(/ts/);
      runtimeCaching = [
        {
          urlPattern: /.*/i,
          handler: "NetworkOnly",
          options: {
            cacheName: "dev",
          },
        },
      ];
      shutWorkboxAfterCalledUp = true;
    } else {
      runtimeCaching = resolveRuntimeCaching(
        userRuntimeCaching,
        extendDefaultRuntimeCaching
      );
    }

    if (dynamicStartUrl) {
      runtimeCaching.unshift({
        urlPattern: basePath,
        handler: "NetworkFirst",
        options: {
          cacheName: "start-url",
          plugins: [
            {
              async cacheWillUpdate({ response }) {
                if (response && response.type === "opaqueredirect") {
                  return new Response(response.body, {
                    status: 200,
                    statusText: "OK",
                    headers: response.headers,
                  });
                }
                return response;
              },
            },
          ],
        },
      });
    }

    if (hasFallbacks) {
      runtimeCaching.forEach((cacheEntry) => {
        if (
          !cacheEntry.options ||
          cacheEntry.options.precacheFallback ||
          cacheEntry.options.plugins?.find(
            (plugin) => "handlerDidError" in plugin
          )
        ) {
          return;
        }

        if (!cacheEntry.options.plugins) {
          cacheEntry.options.plugins = [];
        }

        cacheEntry.options.plugins.push({
          async handlerDidError({ request }) {
            if (typeof self !== "undefined") {
              return self.fallback(request);
            }
            return Response.error();
          },
        });
      });
    }

    const workboxPlugin = new WorkboxPlugin.GenerateSW({
      ...workboxCommon,
      skipWaiting,
      clientsClaim,
      cleanupOutdatedCaches,
      ignoreURLParametersMatching,
      importScripts,
      ...workboxOptions,
      runtimeCaching,
    });

    if (shutWorkboxAfterCalledUp) {
      overrideAfterCalledMethod(workboxPlugin);
    }

    return workboxPlugin;
  }
};
