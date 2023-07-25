---
"@ducanh2912/next-pwa": minor
---

feat(next-pwa): added `customWorkerDest`, `customWorkerPrefix`, use file hashing for workers' output filenames' suffix

- `customWorkerPrefix` works like our `sw` option, except that it is just a prefix and not the whole name to allow having a hash at the end of the custom worker's output filename.

- This also deprecates `customWorkerDir` and replaces it with `customWorkerSrc` to align with `customWorkerDest` so as to avoid confusion.

- We now use file hashing instead of `buildId` for our workers' output filenames' suffix.
