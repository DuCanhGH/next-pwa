const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: false,
  workboxOptions: {
    skipWaiting: false,
  },
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
