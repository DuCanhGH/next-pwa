# Zero-config [PWA](https://web.dev/learn/pwa/) plugin for [Next.js](https://nextjs.org/)

This plugin is powered by [Workbox](https://developer.chrome.com/docs/workbox/) and other good stuff.

[![Build Size](https://img.shields.io/bundlephobia/minzip/@ducanh2912/next-pwa?label=Bundle%20size&style=flat&color=success)](https://bundlephobia.com/result?p=@ducanh2912/next-pwa)
[![Version](https://img.shields.io/npm/v/@ducanh2912/next-pwa?style=flat&color=success)](https://www.npmjs.com/package/@ducanh2912/next-pwa)

## Features

- 0️⃣ No configuration needed, but is configurable using `Workbox`'s options and our own options.
- ✨ Optimized precaching and runtime caching.
- 💯 Maximal Lighthouse score.
- 🎈 Easy-to-understand examples.
- 📴 Offline support [(you can also provide fallbacks for when fetching fails)](/examples/offline-fallback-v2).
- 🔉 Default range requests for audios and videos.
- 📐 [Custom worker to run your own code (also supports path aliases, TypeScript and code splitting!).](/examples/custom-worker)
- 📜 [Public environment variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables) are available in custom workers.
- 🐞 Debug service worker in development mode.
- 🌏 [Internationalization support with `next-i18next`.](/examples/next-i18next)
- ⚡ Supports [blitz.js](https://blitzjs.com/) (simply add `blitz.config.js`) and [GitPod](https://gitpod.io/#https://github.com/DuCanhGH/next-pwa/).

---

## Getting Started

Visit https://ducanh-next-pwa.vercel.app/docs/next-pwa/getting-started to get started with `next-pwa`.

## Documentation

Visit https://ducanh-next-pwa.vercel.app/docs/next-pwa to see the documentation.

## Community

You can ask questions, suggest features, and share your projects on [Github Discussions](https://github.com/DuCanhGH/next-pwa/discussions).

Please follow our [Code of Conduct](/CODE_OF_CONDUCT.md) when you communicate with other people.

## Contributing

Please see [our contributing guide](/CONTRIBUTING.md).

## Reference

1. [Google Workbox](https://developer.chrome.com/docs/workbox/what-is-workbox/)
2. [ServiceWorker, MessageChannel, & postMessage](https://ponyfoo.com/articles/serviceworker-messagechannel-postmessage) by [Nicolás Bevacqua](https://ponyfoo.com/contributors/ponyfoo)
3. [The service worker lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)
4. [6 Tips to make your iOS PWA feel like a native app](https://www.netguru.com/codestories/pwa-ios)
5. [Make your PWA available on Google Play Store](https://www.netguru.com/codestories/make-your-pwa-available-on-google-play-store)
