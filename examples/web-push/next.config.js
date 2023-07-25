const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
