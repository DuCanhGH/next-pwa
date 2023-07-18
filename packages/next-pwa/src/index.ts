import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadTSConfig, logger } from "@ducanh2912/utils";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import fg from "fast-glob";
import type { NextConfig } from "next";
import type NextConfigShared from "next/dist/server/config-shared.js";
import type { Configuration, default as Webpack } from "webpack";
import type { RuntimeCaching } from "workbox-build";
import WorkboxPlugin from "workbox-webpack-plugin";

import defaultCache from "./cache.js";
import { resolveRuntimeCaching } from "./resolve-runtime-caching.js";
import { resolveWorkboxCommon } from "./resolve-workbox-common.js";
import type { PluginOptions } from "./types.js";
import { isInjectManifestConfig, overrideAfterCalledMethod } from "./utils.js";
import { setDefaultContext } from "./webpack-builders/context.js";
import {
  buildCustomWorker,
  buildFallbackWorker,
  buildSWEntryWorker,
  getDefaultDocumentPage,
} from "./webpack-builders/index.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const getRevision = (file: fs.PathOrFileDescriptor) =>
  crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex");

const withPWAInit = (
  pluginOptions: PluginOptions = {}
): ((nextConfig?: NextConfig) => NextConfig) => {
  return (nextConfig = {}) => ({
    ...nextConfig,
    webpack(config: Configuration, options) {
      let nextDefConfig: NextConfig | undefined;

      try {
        nextDefConfig = (
          require("next/dist/server/config-shared") as typeof NextConfigShared
        ).defaultConfig;
      } catch {
        // do nothing - we are using Next's internals.
      }

      const isAppDirEnabled =
        nextConfig.experimental?.appDir ??
        nextDefConfig?.experimental?.appDir ??
        true;

      const webpack: typeof Webpack = options.webpack;
      const {
        buildId,
        dev,
        config: {
          distDir = ".next",
          pageExtensions = ["tsx", "ts", "jsx", "js", "mdx"],
        },
      } = options;

      const basePath = options.config.basePath || "/";

      const tsConfigJSON = loadTSConfig(
        options.dir,
        nextConfig?.typescript?.tsconfigPath
      );

      // For Workbox configurations:
      // https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-webpack-plugin.GenerateSW
      const {
        disable = false,
        register = true,
        dest = distDir,
        sw = "sw.js",
        cacheStartUrl = true,
        dynamicStartUrl = true,
        dynamicStartUrlRedirect,
        publicExcludes = ["!noprecache/**/*"],
        buildExcludes = [],
        fallbacks = {},
        cacheOnFrontEndNav = false,
        aggressiveFrontEndNavCaching = false,
        reloadOnOnline = true,
        scope = basePath,
        customWorkerDir = "worker",
        workboxOptions = {},
        extendDefaultRuntimeCaching = false,
        swcMinify = nextConfig.swcMinify ?? nextDefConfig?.swcMinify ?? false,
      } = pluginOptions;

      const {
        swSrc,
        additionalManifestEntries,
        modifyURLPrefix = {},
        manifestTransforms = [],
        // @ts-expect-error removed from types
        exclude,
        ...workbox
      } = workboxOptions;

      if (typeof nextConfig.webpack === "function") {
        config = nextConfig.webpack(config, options);
      }

      Object.keys(workbox).forEach(
        (key) => workbox[key] === undefined && delete workbox[key]
      );

      const importScripts: string[] = [];

      if (!config.plugins) {
        config.plugins = [];
      }

      if (disable) {
        options.isServer && logger.info("PWA support is disabled.");
        return config;
      }

      logger.info(
        `Compiling for ${options.isServer ? "server" : "client (static)"}...`
      );

      const _scope = path.posix.join(scope, "/");

      // inject register script to main.js
      const _sw = path.posix.join(basePath, sw.startsWith("/") ? sw : `/${sw}`);
      config.plugins.push(
        new webpack.DefinePlugin({
          __PWA_SW__: `'${_sw}'`,
          __PWA_SCOPE__: `'${_scope}'`,
          __PWA_ENABLE_REGISTER__: `${Boolean(register)}`,
          __PWA_START_URL__: dynamicStartUrl ? `'${basePath}'` : undefined,
          __PWA_CACHE_ON_FRONT_END_NAV__: `${Boolean(cacheOnFrontEndNav)}`,
          __PWA_AGGRFEN_CACHE__: `${Boolean(aggressiveFrontEndNavCaching)}`,
          __PWA_RELOAD_ON_ONLINE__: `${Boolean(reloadOnOnline)}`,
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
          if (entries["main-app"] && !entries["main-app"].includes(swEntryJs)) {
            if (Array.isArray(entries["main-app"])) {
              entries["main-app"].unshift(swEntryJs);
            } else if (typeof entries["main-app"] === "string") {
              entries["main-app"] = [swEntryJs, entries["main-app"]];
            }
          }
          return entries;
        });

      if (!options.isServer) {
        setDefaultContext({
          shouldMinify: !dev,
          useSwcMinify: swcMinify,
        });

        const _dest = path.join(options.dir, dest);
        const sweWorkerName = buildSWEntryWorker({
          id: buildId,
          destDir: _dest,
          shouldGenSWEWorker: cacheOnFrontEndNav,
        });

        config.plugins.push(
          new webpack.DefinePlugin({
            __PWA_SW_ENTRY_WORKER__: sweWorkerName && `'${sweWorkerName}'`,
          })
        );

        const customWorkerScriptName = buildCustomWorker({
          id: buildId,
          baseDir: options.dir,
          customWorkerDir,
          destDir: _dest,
          plugins: config.plugins.filter(
            (plugin) => plugin instanceof webpack.DefinePlugin
          ),
          tsconfig: tsConfigJSON,
        });

        if (!!customWorkerScriptName) {
          importScripts.unshift(customWorkerScriptName);
        }

        if (!register) {
          logger.info(
            `Service worker won't be automatically registered as per the config, please call the following code in a componentDidMount callback or useEffect hook:`
          );
          logger.info(`  window.workbox.register()`);
          if (
            !tsConfigJSON?.compilerOptions?.types?.includes(
              "@ducanh2912/next-pwa/workbox"
            )
          ) {
            logger.info(
              "You may also want to add @ducanh2912/next-pwa/workbox to compilerOptions.types in your tsconfig.json/jsconfig.json."
            );
          }
        }

        logger.info(`Service worker: ${path.join(dest, sw)}`);
        logger.info(`  URL: ${_sw}`);
        logger.info(`  Scope: ${_scope}`);

        config.plugins.push(
          new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: [
              path.join(_dest, "workbox-*.js"),
              path.join(_dest, "workbox-*.js.map"),
              path.join(_dest, sw),
              path.join(_dest, `${sw}.map`),
            ],
          })
        );

        // precache files in public folder
        let manifestEntries = additionalManifestEntries ?? [];
        if (!manifestEntries) {
          manifestEntries = fg
            .sync(
              [
                "**/*",
                "!workbox-*.js",
                "!workbox-*.js.map",
                "!worker-*.js",
                "!worker-*.js.map",
                "!fallback-*.js",
                "!fallback-*.js.map",
                `!${sw.replace(/^\/+/, "")}`,
                `!${sw.replace(/^\/+/, "")}.map`,
                ...publicExcludes,
              ],
              {
                cwd: "public",
              }
            )
            .map((f) => ({
              url: path.posix.join(basePath, `/${f}`),
              revision: getRevision(`public/${f}`),
            }));
        }

        if (cacheStartUrl) {
          if (!dynamicStartUrl) {
            manifestEntries.push({
              url: basePath,
              revision: buildId,
            });
          } else if (
            typeof dynamicStartUrlRedirect === "string" &&
            dynamicStartUrlRedirect.length > 0
          ) {
            manifestEntries.push({
              url: dynamicStartUrlRedirect,
              revision: buildId,
            });
          }
        }

        let hasFallbacks = false;

        if (fallbacks) {
          if (!fallbacks.document) {
            fallbacks.document = getDefaultDocumentPage(
              options.dir,
              pageExtensions,
              isAppDirEnabled
            );
          }
          const res = buildFallbackWorker({
            id: buildId,
            fallbacks,
            destDir: _dest,
          });

          if (res) {
            hasFallbacks = true;
            importScripts.unshift(res.name);
            res.precaches.forEach((route) => {
              if (
                route &&
                typeof route !== "boolean" &&
                !manifestEntries.find(
                  (entry) =>
                    typeof entry !== "string" && entry.url.startsWith(route)
                )
              ) {
                manifestEntries.push({
                  url: route,
                  revision: buildId,
                });
              }
            });
          }
        }

        const workboxCommon = resolveWorkboxCommon({
          dest: _dest,
          sw,
          dev,
          buildId,
          buildExcludes,
          manifestEntries,
          manifestTransforms,
          modifyURLPrefix,
          publicPath: config.output?.publicPath,
        });

        if (isInjectManifestConfig(workboxOptions)) {
          const swSrc = path.join(options.dir, workboxOptions.swSrc);
          logger.info(`Using InjectManifest with ${swSrc}`);
          const workboxPlugin = new WorkboxPlugin.InjectManifest({
            ...workboxCommon,
            ...workbox,
            swSrc,
          });
          if (dev) {
            overrideAfterCalledMethod(workboxPlugin);
          }
          config.plugins.push(workboxPlugin);
        } else {
          const {
            skipWaiting = true,
            clientsClaim = true,
            cleanupOutdatedCaches = true,
            ignoreURLParametersMatching = [],
            importScripts: userSpecifiedImportScripts,
            runtimeCaching: userSpecifiedRuntimeCaching,
          } = workboxOptions;

          let runtimeCaching: RuntimeCaching[];

          if (userSpecifiedImportScripts) {
            for (const script of userSpecifiedImportScripts) {
              importScripts.push(script);
            }
          }

          let shutWorkboxAfterCalledUp = false;

          if (dev) {
            logger.info(
              "Building in development mode, caching and precaching are disabled for the most part. This means that offline support is disabled, but you can continue developing other functions in service worker."
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
              userSpecifiedRuntimeCaching,
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
                    cacheWillUpdate: async ({ response }) => {
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
              if (!cacheEntry.options) return;
              if (cacheEntry.options.precacheFallback) return;
              if (
                Array.isArray(cacheEntry.options.plugins) &&
                cacheEntry.options.plugins.find(
                  (plugin) => "handlerDidError" in plugin
                )
              )
                return;
              if (!cacheEntry.options.plugins) {
                cacheEntry.options.plugins = [];
              }
              cacheEntry.options.plugins.push({
                handlerDidError: async ({ request }) => {
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
            ...workbox,
            runtimeCaching,
          });

          if (shutWorkboxAfterCalledUp) {
            overrideAfterCalledMethod(workboxPlugin);
          }

          config.plugins.push(workboxPlugin);
        }
      }
      return config;
    },
  });
};

export default withPWAInit;
export { defaultCache as runtimeCaching };
export * from "./types.js";
