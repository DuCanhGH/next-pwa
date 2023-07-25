import type { GenerateSWConfig } from "workbox-webpack-plugin";

import type { WorkboxTypes } from "./private-types.js";

export interface PluginOptions {
  /**
   * Disable PWA. Set to `true` to completely disable PWA, set to `false` to
   * generate service worker in both dev and prod.
   * @default false
   */
  disable?: boolean;
  /**
   * Allow this plugin to automatically register the service worker for you. Set
   * this to `false` when you want to register the service worker yourself (this
   * can be done by running `window.workbox.register()` in
   * `componentDidMount`/`useEffect` in your app).
   * @example
   *   ```tsx
   *   // app/register-pwa.tsx
   *   "use client";
   *   import type { Workbox } from "workbox-window";
   *
   *   declare global {
   *     interface Window {
   *       workbox: Workbox;
   *     }
   *   }
   *
   *   export default function RegisterPWA() {
   *     useEffect(() => {
   *       if ("serviceWorker" in navigator && window.workbox !== undefined) {
   *         const wb = window.workbox;
   *         wb.register();
   *       }
   *     }, []);
   *     return <></>;
   *   }
   *
   *   // app/layout.tsx
   *   import RegisterPWA from "./register-pwa";
   *
   *   export default function RootLayout({
   *     children,
   *   }: {
   *     children: React.ReactNode;
   *   }) {
   *     return (
   *       <html lang="en">
   *         <head />
   *         <body>
   *           <RegisterPWA />
   *           {children}
   *         </body>
   *       </html>
   *     );
   *   }
   *   ```
   * @default true
   */
  register?: boolean;
  // NEXT-PWA-TODO(major): change this option's default to `"public"`
  /**
   * Set output directory for service worker. Relative to Next.js's root
   * directory. By default, this plugin uses `.next`, but it is recommended to
   * change it to `public` instead.
   * @default ".next"
   */
  dest?: string;
  /**
   * Service worker script's filename. Set to a string if you want to customize
   * the output filename.
   * @default "/sw.js"
   */
  sw?: string;
  /**
   * Turn on caching for start URL. [Discussion of use cases for this
   * option](https://github.com/shadowwalker/next-pwa/pull/296#issuecomment-1094167025)
   * @default true
   */
  cacheStartUrl?: boolean;
  /**
   * If your start URL returns different HTML document under different states
   * (such as logged in vs. not logged in), this should be set to true.
   * Effective only when `cacheStartUrl` is set to `true`. Set to `false` if
   * your start URL always returns same HTML document, then start URL will be
   * precached and as such help speed up first load time.
   * @default true
   */
  dynamicStartUrl?: boolean;
  /**
   * If your start URL redirect to another route such as `/login`, it's
   * recommended to setup this redirected URL for the best user experience.
   * Effective when `dynamicStartUrl` is set to `true`
   * @default undefined
   */
  dynamicStartUrlRedirect?: string;
  /**
   * An array of glob pattern strings to exclude files in the public folder from
   * being precached. By default, this plugin excludes public/noprecache.
   * Remember to add ! before each glob pattern for it to work :)
   * @example
   *   ```ts
   *   ["!img/super-large-image.jpg", "!fonts/not-used-fonts.otf"];
   *   ```
   */
  publicExcludes?: string[];
  /**
   * One or more specifiers used to exclude assets from the precache manifest.
   * This is interpreted following the same rules as Webpack's standard `exclude`
   * option. Relative to `.next/static` or your custom build folder. Defaults to
   * [].
   * @example
   *   ```ts
   *   [/chunks\/images\/.*$/];
   *   ```
   * @default
   *   ```ts
   *   [];
   *   ```
   */
  buildExcludes?: GenerateSWConfig["exclude"];
  /**
   * Config precached routes to fallback when both cache and network are not
   * available to serve resources. If you just need a offline fallback page,
   * simply create a `/_offline.tsx` file in your `pages/` dir or a
   * `/~offline/page.tsx` file in your `app/` dir and you are all set, no
   * configuration necessary.
   */
  fallbacks?: FallbackRoutes;
  /**
   * Enable additional route caching when users navigate through pages with
   * `next/link`. This improves user experience in some cases but it
   * also adds some overhead because of additional network calls.
   * @default false
   */
  cacheOnFrontEndNav?: boolean;
  /**
   * EXPERIMENTAL.
   * Cache every `<link rel="stylesheet" />` and `<script />` on frontend navigation.
   * Requires `cacheOnFrontEndNav` to be enabled.
   * @default false
   */
  aggressiveFrontEndNavCaching?: boolean;
  /**
   * URL scope for PWA. Set to `/foo` so that paths under `/foo` are PWA while others
   * are not.
   * @default nextConfig.basePath
   */
  scope?: string;
  // NEXT-PWA-TODO(major): remove this option
  /**
   * @deprecated renamed to `customWorkerSrc`, to be removed next major version.
   */
  customWorkerDir?: string;
  /**
   * Change the directory `next-pwa` uses to look for a custom worker
   * implementation to add to the service worker generated by `workbox`. For more
   * information, check out the [custom worker
   * example](https://github.com/DuCanhGH/next-pwa/tree/master/examples/custom-worker).
   * `next-pwa` will look into root and `src` directory for this directory.
   * Relative to Next.js's root directory.
   * @default "worker"
   */
  customWorkerSrc?: string;
  /**
   * Works the same as `dest`, but is for the custom worker. This defaults to `dest`.
   * @default dest
   */
  customWorkerDest?: string;
  /**
   * Reload the app when it detects that it has gone back online.
   * @default true
   */
  reloadOnOnline?: boolean;
  /**
   * Pass options to `workbox-webpack-plugin`. This one relies on
   * `workbox-webpack-plugin`'s own JSDoc, so some information may not be
   * exactly correct.
   */
  workboxOptions?: WorkboxTypes[keyof WorkboxTypes];
  /**
   * Extend the default `runtimeCaching` array when `runtimeCaching` is specified.
   * Entries having the same `cacheName` as any entry in the default `runtimeCaching`
   * array will override it.
   * @default false
   */
  extendDefaultRuntimeCaching?: boolean;
  /**
   * Use [`swc`](https://swc.rs) to minify the custom worker, the fallback worker, and more.
   * @default nextConfig.swcMinify
   */
  swcMinify?: boolean;
}

export interface FallbackRoutes {
  /**
   * Fallback route for document (pages).
   * @default
   *   ```js
   *   "/_offline" // or none if it doesn't exist.
   *   ```
   */
  document?: string;
  /**
   * Fallback route for data, defaults to none.
   * @default undefined
   */
  data?: string;
  /**
   * Fallback route for images, defaults to none.
   * @default undefined
   */
  image?: string;
  /**
   * Fallback route for audios, defaults to none.
   * @default undefined
   */
  audio?: string;
  /**
   * Fallback route for videos, defaults to none.
   * @default undefined
   */
  video?: string;
  /**
   * Fallback route for fonts, defaults to none.
   * @default undefined
   */
  font?: string;
}
