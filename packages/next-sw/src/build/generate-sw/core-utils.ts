import fs from "node:fs";
import path from "node:path";

import { findFirstTruthy, logger } from "@ducanh2912/utils";
import type { NextConfig } from "next";

import type { FallbackRoutes } from "../../types.js";

/**
 * Get the default document page for fallbackRoutes.
 * @param baseDir
 * @param pageExtensions
 * @param isAppDirEnabled
 * @returns
 */
export const getDefaultDocumentPage = (
  baseDir: string,
  pageExtensions: string[],
  isAppDirEnabled: boolean
) => {
  const pagesDir = findFirstTruthy(["pages", "src/pages"], (dir) => {
    dir = path.join(baseDir, dir);
    return fs.existsSync(dir) ? dir : undefined;
  });
  const appDir = isAppDirEnabled
    ? findFirstTruthy(["app", "src/app"], (dir) => {
        dir = path.join(baseDir, dir);
        return fs.existsSync(dir) ? dir : undefined;
      })
    : undefined;

  if (!pagesDir && !appDir) {
    return undefined;
  }

  for (const ext of pageExtensions) {
    if (appDir) {
      const appDirOffline = path.join(appDir, `~offline/page.${ext}`);
      if (fs.existsSync(appDirOffline)) {
        return "/~offline";
      }
    }
    if (pagesDir) {
      const pagesDirOffline = path.join(pagesDir, `_offline.${ext}`);
      if (pagesDirOffline && fs.existsSync(pagesDirOffline)) {
        return "/_offline";
      }
    }
  }

  return undefined;
};

/**
 * Get paths of fallbackRoutes as environment variables for
 * webpack.EnvironmentPlugin()
 * @param param0
 * @returns
 */
export const getFallbackEnvs = ({
  fallbackRoutes,
  id,
}: {
  fallbackRoutes: FallbackRoutes;
  baseDir: string;
  id: string;
  pageExtensions: NonNullable<NextConfig["pageExtensions"]>;
  isAppDirEnabled: boolean;
}) => {
  let { data } = fallbackRoutes;

  if (data && data.endsWith(".json")) {
    data = path.posix.join("/_next/data", id, data);
  }

  const envs = {
    __PWA_FALLBACK_DOCUMENT__: fallbackRoutes.document || false,
    __PWA_FALLBACK_IMAGE__: fallbackRoutes.image || false,
    __PWA_FALLBACK_AUDIO__: fallbackRoutes.audio || false,
    __PWA_FALLBACK_VIDEO__: fallbackRoutes.video || false,
    __PWA_FALLBACK_FONT__: fallbackRoutes.font || false,
    __PWA_FALLBACK_DATA__: data || false,
  };

  if (Object.values(envs).filter((v) => !!v).length === 0) return;

  logger.info(
    "This app will fallback to these precached routes when fetching from cache or network fails:"
  );

  if (envs.__PWA_FALLBACK_DOCUMENT__) {
    logger.info(`  Documents (pages): ${envs.__PWA_FALLBACK_DOCUMENT__}`);
  }
  if (envs.__PWA_FALLBACK_IMAGE__) {
    logger.info(`  Images: ${envs.__PWA_FALLBACK_IMAGE__}`);
  }
  if (envs.__PWA_FALLBACK_AUDIO__) {
    logger.info(`  Audio: ${envs.__PWA_FALLBACK_AUDIO__}`);
  }
  if (envs.__PWA_FALLBACK_VIDEO__) {
    logger.info(`  Videos: ${envs.__PWA_FALLBACK_VIDEO__}`);
  }
  if (envs.__PWA_FALLBACK_FONT__) {
    logger.info(`  Fonts: ${envs.__PWA_FALLBACK_FONT__}`);
  }
  if (envs.__PWA_FALLBACK_DATA__) {
    logger.info(
      `  Data (/_next/data/**/*.json): ${envs.__PWA_FALLBACK_DATA__}`
    );
  }

  return envs;
};
