// Source: https://github.com/contentlayerdev/website/blob/main/src/utils/sluggify.ts

export const sluggifyTitle = (title: string) =>
  title
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");
