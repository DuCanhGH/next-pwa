import path from "node:path";

import type { Asset, Configuration } from "webpack";
import type { ManifestEntry, ManifestTransform } from "workbox-build";
import type { GenerateSWConfig } from "workbox-webpack-plugin";

import type { SharedWorkboxOptionsKeys } from "./private-types.js";
import type { PluginOptions } from "./types.js";

export interface ResolveWorkboxCommonOptions {
  dest: string;
  sw: string;
  dev: boolean;
  buildId: string;
  buildExcludes: NonNullable<PluginOptions["buildExcludes"]>;
  manifestEntries: (string | ManifestEntry)[];
  manifestTransforms: ManifestTransform[];
  modifyURLPrefix: Record<string, string>;
  publicPath: NonNullable<Configuration["output"]>["publicPath"];
}

export type WorkboxCommon = Pick<GenerateSWConfig, SharedWorkboxOptionsKeys>;

export const resolveWorkboxCommon = ({
  dest,
  sw,
  dev,
  buildId,
  buildExcludes,
  manifestEntries,
  manifestTransforms,
  modifyURLPrefix,
  publicPath,
}: ResolveWorkboxCommonOptions): WorkboxCommon => ({
  swDest: path.join(dest, sw),
  additionalManifestEntries: dev ? [] : manifestEntries,
  exclude: [
    ...buildExcludes,
    ({ asset }: { asset: Asset }) => {
      if (
        asset.name.startsWith("server/") ||
        asset.name.match(
          /^((app-|^)build-manifest\.json|react-loadable-manifest\.json)$/
        )
      ) {
        return true;
      }
      if (dev && !asset.name.startsWith("static/runtime/")) {
        return true;
      }
      return false;
    },
  ],
  modifyURLPrefix: {
    ...modifyURLPrefix,
    "/_next/../public/": "/",
  },
  manifestTransforms: [
    ...manifestTransforms,
    async (manifestEntries, compilation) => {
      const manifest = manifestEntries.map((m) => {
        m.url = m.url.replace("/_next//static/image", "/_next/static/image");
        m.url = m.url.replace("/_next//static/media", "/_next/static/media");
        if (m.revision === null) {
          let key = m.url;
          if (typeof publicPath === "string" && key.startsWith(publicPath)) {
            key = m.url.substring(publicPath.length);
          }
          const asset = (compilation as any).assetsInfo.get(key);
          m.revision = asset ? asset.contenthash || buildId : buildId;
        }
        m.url = m.url.replace(/\[/g, "%5B").replace(/\]/g, "%5D");
        return m;
      });
      return { manifest, warnings: [] };
    },
  ],
});
