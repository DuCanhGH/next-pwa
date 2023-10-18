import { createDescribe } from "../../test-utils/index.ts";

createDescribe(
  "e2e app-dir",
  { sourceDir: __dirname, skipInstall: false },
  ({ next }) => {
    it("should render", async () => {
      const $ = await next.render("/");
      expect($("#welcome-text").text()).toBe("This is a Next.js PWA!");
      expect($("#app-root-text").text()).toBe("This is placed at _app.tsx!");
    });

    it("should fetch image", async () => {
      const image = await next.fetch("/next.svg");
      expect(image.status).toBe(200);
      const favicon = await next.fetch("/favicon.ico");
      expect(favicon.status).toBe(200);
    });

    it("should be able to fetch service worker", async () => {
      const sw = await next.fetch("/sw.js");
      expect(sw.status).toBe(200);
      expect(
        sw.headers.get("Content-Type")?.includes("application/javascript")
      ).toBe(true);
    });
  }
);
