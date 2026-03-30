/** @type {import('next').NextConfig} */
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    // Cache all Next.js static assets — cache-first
    {
      urlPattern: /^https?.*(\_next\/static).*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    // Cache Next.js image assets
    {
      urlPattern: /^https?.*(\_next\/image).*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
      },
    },
    // Cache page navigations — network-first with offline fallback
    {
      urlPattern: /^https?.*\/$/,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    // Cache all other app pages
    {
      urlPattern: /^https?.*\/(read|learn|journal).*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "app-pages",
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 },
      },
    },
    // Cache Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  // Dev-only: filesystem webpack cache can reference missing chunks after interrupted
  // compiles (Internal Server Error / Cannot find module './NNN.js'). Disabling avoids that
  // at the cost of slightly slower first compile per run.
  webpack: (/** @type {import('webpack').Configuration} */ config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = withPWA(nextConfig);
