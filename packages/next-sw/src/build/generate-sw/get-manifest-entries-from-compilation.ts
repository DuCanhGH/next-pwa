import crypto from "node:crypto";
import path from "node:path";

import type { Asset, Compilation } from "webpack";
import type Webpack from "webpack";

import type { ManifestEntry } from "../../private-types.js";
import type { FilterEntry } from "../../types.js";
import type { GenerateSWWebpackConfig } from "./webpack-plugin.js";

const checkConditions = (
  webpack: typeof Webpack,
  asset: Asset,
  compilation: Compilation,
  conditions: FilterEntry[] = []
) => {
  for (const condition of conditions) {
    if (typeof condition === "function") {
      return condition({ asset, compilation });
    }
    if (webpack.ModuleFilenameHelpers.matchPart(asset.name, condition)) {
      return true;
    }
  }

  return false;
};

const getAssetHash = (asset: Asset) => {
  if (asset.info && asset.info.immutable) {
    return null;
  }
  return crypto
    .createHash("md5")
    .update(Buffer.from(asset.source.source()))
    .digest("hex");
};

interface ManifestTransformResultWithWarnings {
  manifestEntries: ManifestEntry[];
  warnings: string[];
}

const transformManifest = async ({
  originalManifest,
}: {
  originalManifest: ManifestEntry[];
}) => {
  const allWarnings: Array<string> = [];

  // TODO: add transform.

  return {
    manifestEntries: originalManifest,
    warnings: allWarnings,
  } as ManifestTransformResultWithWarnings;
};

const resolveURL = (
  publicPath: Compilation["options"]["output"]["publicPath"],
  ...paths: string[]
) => {
  if (typeof publicPath !== "string" || publicPath === "auto") {
    return path.join(...paths);
  }
  return path.join(publicPath, ...paths);
};

const normalizePathSep = (path: string) => path.replace(/\\/g, "/");

export const getManifestEntriesFromCompilation = async (
  compilation: Compilation,
  config: GenerateSWWebpackConfig
) => {
  if (!config.webpackInstance) {
    return undefined;
  }
  
  const assets = compilation.getAssets();

  const { publicPath } = compilation.options.output;

  const originalManifest: (ManifestEntry & {
    size: number;
  })[] = [];

  for (const asset of assets) {
    const isExcluded = checkConditions(config.webpackInstance, asset, compilation, config.exclude);
    if (isExcluded) {
      continue;
    }
    const isIncluded =
      !!config.include && checkConditions(config.webpackInstance, asset, compilation, config.include);

    if (!isIncluded) {
      continue;
    }

    originalManifest.push({
      url: normalizePathSep(resolveURL(publicPath, asset.name)),
      revision: getAssetHash(asset),
      size: asset.source.size() || 0,
    });
  }

  const { manifestEntries, warnings } = await transformManifest({
    originalManifest,
  });

  for (const warning of warnings) {
    compilation.warnings.push(new config.webpackInstance.WebpackError(warning));
  }

  // Ensure that the entries are properly sorted by URL.
  const sortedEntries = manifestEntries.sort((a, b) =>
    a.url === b.url ? 0 : a.url > b.url ? 1 : -1
  );

  return { sortedEntries };
};
