// @ts-check
/**
 * @typedef {import("next").NextConfig} NextConfig
 * @typedef {((config?: NextConfig | undefined) => NextConfig) | ((config: NextConfig) => NextConfig)} NextConfigPlugin
 */
const withPWAInit = require("@ducanh2912/next-pwa").default;
const withContentlayer = require("next-contentlayer").withContentlayer;

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
});

/** @type {NextConfig} */
const nextConfig = {
  output: "export",
  experimental: {
    appDir: true,
    extensionAlias: {
      ".js": [".js", ".ts", ".tsx"],
    },
  },
  reactStrictMode: true,
};

/** @type {NextConfigPlugin[]} */
const plugins = [withPWA, withContentlayer];

/**
 * @type {(
 *     phase: string,
 *     { defaultConfig }: { defaultConfig: NextConfig },
 * ) => NextConfig}
 */
const nextComposePlugins = () =>
  plugins.reduce((acc, plugin) => plugin(acc), nextConfig);

module.exports = nextComposePlugins;
