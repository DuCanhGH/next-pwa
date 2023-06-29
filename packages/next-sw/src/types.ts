import type { Asset, Compilation } from "webpack";

export type ImportScripts = string[] | undefined;

export type FilterEntry =
  | string
  | RegExp
  | ((args: { asset: Asset; compilation: Compilation }) => boolean);

export interface PluginOptions {
  /**
   * Disable PWA. Set to `true` to completely disable PWA, set to `false` to
   * generate service worker in both dev and prod.
   *
   * @default false
   */
  disable?: boolean;
  /**
   * Set output directory for service worker. Relative to Next.js's root
   * directory.
   *
   * @default "public"
   */
  dest?: string;
  /**
   * One or more specifiers used to exclude assets from the precache manifest.
   */
  exclude?: FilterEntry[];
  /**
   * Config precached routes to fallback when both cache and network are not
   * available to serve resources. If you just need a offline fallback page,
   * simply create a `/_offline.tsx` file in your `pages/` dir or a
   * `/~offline/page.tsx` file in your `app/` dir and you are all set, no
   * configuration necessary.
   */
  fallbackRoutes?: FallbackRoutes;
  /**
   * One or more specifiers used to include assets from the precache manifest.
   */
  include?: FilterEntry[];
  /**
   * A list of JavaScript files that should be passed to `importScripts()` inside
   * the generated service worker file. This is useful when you want to let
   * `next-pwa` create your top-level service worker file, but want to include some
   * additional code, such as a push event listener.
   */
  importScripts?: ImportScripts;
  /**
   * Toggle logging in service worker. By default it is only enabled in dev.
   *
   * @default context.dev
   */
  logging?: boolean;
  /**
   * Allow this plugin to automatically register the service worker for you. Set
   * this to `false` when you want to register the service worker yourself.
   *
   * @default true
   */
  register?: boolean;
  /**
   * Not supported yet.
   * Custom `swSrc`. This will trigger `InjectManifest` instead of `GenerateSW`.
   *
   * @default undefined
   */
  swSrc?: string;
  /**
   * Whether the service worker should run `self.skipWaiting()`.
   *
   * @default true
   */
  skipWaiting?: boolean;
  /**
   * Define how an asset should be cached in runtime. Note that this object is
   * **stringified**, which means that you can't use anything outside of it.
   */
  runtimeCaching?: RuntimeCaching[];
}

export interface FallbackRoutes {
  /**
   * Fallback route for document (pages).
   *
   * @default
   *   ```js
   *   "/_offline" // or none if it doesn't exist.
   *   ```
   */
  document?: string;
  /**
   * Fallback route for data, defaults to none.
   *
   * @default undefined
   */
  data?: string;
  /**
   * Fallback route for images, defaults to none.
   *
   * @default undefined
   */
  image?: string;
  /**
   * Fallback route for audios, defaults to none.
   *
   * @default undefined
   */
  audio?: string;
  /**
   * Fallback route for videos, defaults to none.
   *
   * @default undefined
   */
  video?: string;
  /**
   * Fallback route for fonts, defaults to none.
   *
   * @default undefined
   */
  font?: string;
}

export type StrategyName =
  | "CacheFirst"
  | "CacheOnly"
  | "NetworkFirst"
  | "NetworkOnly";

export interface MatchCallbackOptions {
  request: Request;
  url: URL;
  sameOrigin: boolean;
}

type UrlPattern = RegExp | string | ((args: MatchCallbackOptions) => boolean);

export interface RuntimeCaching {
  /**
   * This match criteria determines whether the configured handler will
   * generate a response for any requests that don't match one of the precached
   * URLs. If multiple `RuntimeCaching` routes are defined, then the first one
   * whose `urlPattern` matches will be the one that responds.
   */
  urlPattern: UrlPattern;
  /**
   * This determines how the runtime route will generate a response.
   * To use one of the built-in strategies, provide its name,
   * such as `'NetworkFirst'`.
   * Alternatively, this can be a callback function that returns a
   * response.
   */
  handler: StrategyName | ((args: MatchCallbackOptions) => Response);
  /**
   * The HTTP method to match against. The default value of `'GET'` is normally
   * sufficient, unless you explicitly need to match `'POST'`, `'PUT'`, or
   * another type of request.
   * @default "GET"
   */
  method?: string;
  options?: {
    /**
     * If provided, this will set the `cacheName` property of the
     * configured in `handler`. Note that if a cacheName is defined
     * multiple times, only the first entry will be picked.
     */
    cacheName?: string;
    /**
     * Not supported yet.
     */
    expiration?: {
      maxEntries?: number;
      maxAgeSeconds?: number;
    };
    /**
     * If provided, this will set time (in seconds) to wait before timing out a
     * request. Note that only `'NetworkFirst'` and `'NetworkOnly'` support
     * `networkTimeoutSeconds`.
     */
    networkTimeoutSeconds?: number;
  };
}
