import type {
  WebpackInjectManifestOptions,
  WebpackPartial,
} from "workbox-build";
import type { GenerateSWConfig } from "workbox-webpack-plugin";

type Impossible<K extends keyof any> = { [P in K]?: never };

export type SharedWorkboxOptionsKeys = keyof GenerateSWConfig &
  keyof WebpackInjectManifestOptions;

export interface WebpackOptions {
  /**
   * One or more specifiers used to exclude assets from the precache manifest.
   * This is interpreted following
   * [the same rules](https://webpack.js.org/configuration/module/#condition)
   * as `webpack`'s standard `exclude` option.
   * If not provided, the default value is `[/\/_next\/static\/.*(?<!\.p)\.woff2/, /\.map$/, /^manifest.*\.js$/]`
   */
  exclude?: WebpackPartial["exclude"];
}

export interface GenerateSWOptions
  extends GenerateSWConfig,
    WebpackOptions,
    Impossible<
      Exclude<keyof WebpackInjectManifestOptions, SharedWorkboxOptionsKeys>
    > {
  /**
   * Whether to add an unconditional call to [`skipWaiting()`](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle#skip_the_waiting_phase)
   * to the generated service worker. If `false`, then a `message` listener will
   * be added instead, allowing client pages to trigger `skipWaiting()` by
   * calling `postMessage({type: 'SKIP_WAITING'})` on a waiting service worker.
   * @default true
   */
  skipWaiting?: GenerateSWConfig["skipWaiting"];
  /**
   * Whether or not the service worker should [start controlling](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle#clientsclaim)
   * any existing clients as soon as it activates.
   * @default true
   */
  clientsClaim?: GenerateSWConfig["clientsClaim"];
  /**
   * Whether or not Workbox should attempt to identify and delete any precaches
   * created by older, incompatible versions.
   * @default true
   */
  cleanUpOutdatedCaches?: GenerateSWConfig["cleanupOutdatedCaches"];
  /**
   * Any search parameter names that match against one of the RegExp in this
   * array will be removed before looking for a precache match. This is useful
   * if your users might request URLs that contain, for example, URL parameters
   * used to track the source of the traffic. If not provided, the default value
   * is `[/^utm_/, /^fbclid$/]`.
   * @default
   * ```js
   * [/^utm_/, /^fbclid$/]
   * ```
   * */
  ignoreURLParametersMatching?: GenerateSWConfig["ignoreURLParametersMatching"];
}

export type InjectManifestOptions = WebpackInjectManifestOptions &
  WebpackOptions &
  Impossible<Exclude<keyof GenerateSWConfig, SharedWorkboxOptionsKeys>>;

export type WorkboxTypes = {
  GenerateSW: GenerateSWOptions;
  InjectManifest: InjectManifestOptions;
};

export type StringKeyOf<BaseType> = `${Extract<
  keyof BaseType,
  string | number
>}`;

export interface NextBuildInfo {
  rootDir: string;
  destDir: string;
  basePath: string;
  buildId: string;
  pageExtensions: string[];
  isDev: boolean;
}
