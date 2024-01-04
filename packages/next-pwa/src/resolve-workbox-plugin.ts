import path from "node:path";

import type { RuntimeCaching } from "workbox-build";
import WorkboxPlugin from "workbox-webpack-plugin";

import { logger } from "$utils/index.js";

import type { NextBuildInfo, WorkboxTypes } from "./private-types.js";
import { resolveRuntimeCaching } from "./resolve-runtime-caching.js";
import {
  resolveWorkboxCommon,
  type ResolveWorkboxCommonOptions,
} from "./resolve-workbox-common.js";
import type { PluginOptions } from "./types.js";
import { isInjectManifestConfig, overrideAfterCalledMethod } from "./utils.js";
import {
  buildWorkers,
  type BuildWorkersOptions,
} from "./webpack/builders/build-workers.js";

type PluginCompleteOptions = Required<
  Pick<PluginOptions, "extendDefaultRuntimeCaching" | "dynamicStartUrl">
>;

interface WorkboxPluginOptions
  extends PluginCompleteOptions,
    BuildWorkersOptions,
    ResolveWorkboxCommonOptions,
    NextBuildInfo {
  workboxOptions: WorkboxTypes[keyof WorkboxTypes];
}

export const resolveWorkboxPlugin = ({
  workboxOptions,

  extendDefaultRuntimeCaching,
  dynamicStartUrl,

  // Next.js build info
  rootDir,
  destDir,
  basePath,
  buildId,
  pageExtensions,
  isDev,

  // `buildWorkers` options
  customWorkerSrc,
  customWorkerDest,
  customWorkerPrefix,
  fallbacks,

  // `resolveWorkboxCommon` options
  sw,
  exclude,
  manifestEntries,
  manifestTransforms,
  modifyURLPrefix,
  publicPath,
}: WorkboxPluginOptions) => {
  if (isInjectManifestConfig(workboxOptions)) {
    const swSrc = path.join(rootDir, workboxOptions.swSrc);
    logger.event(`Using InjectManifest with ${swSrc}`);
    const workboxCommon = resolveWorkboxCommon({
      destDir,
      sw,
      isDev,
      buildId,
      exclude,
      manifestEntries,
      manifestTransforms,
      modifyURLPrefix,
      publicPath,
    });
    const workboxPlugin = new WorkboxPlugin.InjectManifest({
      ...workboxOptions,
      ...workboxCommon,
      swSrc,
    });
    if (isDev) {
      overrideAfterCalledMethod(workboxPlugin);
    }
    return [workboxPlugin];
  } else {
    const importScripts: string[] = [];
    const {
      importScripts: workersImportScripts,
      hasFallbacks,
      additionalManifestEntries,
      childCompilationInstances,
    } = buildWorkers({
      rootDir,
      destDir,
      basePath,
      buildId,
      pageExtensions,
      isDev,

      customWorkerSrc,
      customWorkerDest,
      customWorkerPrefix,
      fallbacks,
    });
    importScripts.push(...workersImportScripts);
    manifestEntries.push(...additionalManifestEntries);
    const workboxCommon = resolveWorkboxCommon({
      destDir,
      sw,
      isDev,
      buildId,
      exclude,
      manifestEntries,
      manifestTransforms,
      modifyURLPrefix,
      publicPath,
    });

    const {
      skipWaiting = true,
      clientsClaim = true,
      cleanupOutdatedCaches = true,
      ignoreURLParametersMatching = [/^utm_/, /^fbclid$/],
      importScripts: userImportScripts,
      runtimeCaching: userRuntimeCaching,
      ...workbox
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
      ...workbox,
      ...workboxCommon,
      skipWaiting,
      clientsClaim,
      cleanupOutdatedCaches,
      ignoreURLParametersMatching,
      importScripts,
      runtimeCaching,
    });

    if (shutWorkboxAfterCalledUp) {
      overrideAfterCalledMethod(workboxPlugin);
    }

    return [workboxPlugin, ...childCompilationInstances];
  }
};
