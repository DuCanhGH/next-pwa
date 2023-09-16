---
"@ducanh2912/next-pwa": minor
---

feat: added `PluginOptions.browserslist`

- This defaults to `"chrome >= 56"`, same with Workbox's default.
- Note that `.browserslistrc`, `package.json.browserslist`, etc. are not supported (yet), and the only way to pass the config to `next-pwa` is `PluginOptions.browserslist`, but you can read the file yourself, parse it, then pass it to `next-pwa`.
- This allows you to configure which browsers you want to target your workers for. This tells `next-pwa` to add `PluginOptions.workboxOptions.babelPresetEnvTargets` if that option is not defined, which means that the service worker will, too, be bundled to target these browsers, but you can change that by adding the option.
