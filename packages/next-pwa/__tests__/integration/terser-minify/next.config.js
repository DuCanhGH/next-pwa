const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  swcMinify: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = withPWA(nextConfig);
