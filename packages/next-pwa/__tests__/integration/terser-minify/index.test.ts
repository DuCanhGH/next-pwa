import fg from "fast-glob";
import path from "path";
import { createDescribe } from "tests-utils";

createDescribe(
  "integration terser",
  { sourceDir: __dirname, skipInstall: false },
  ({ next, testMode }) => {
    if (testMode === "start") {
      it("should build offline worker", async () => {
        expect(
          next.cliOutput.includes(
            "This app will fallback to these precached routes when fetching from the cache and the network fails"
          )
        ).toBe(true);

        const fallbackWorkerFiles = (
          await fg("fallback-*.js", {
            cwd: path.join(next.appTestDir, "public"),
          })
        ).map((page) => `/${page}`);

        expect(fallbackWorkerFiles.length > 0).toBe(true);

        await Promise.all(
          fallbackWorkerFiles.map(async (page) => {
            const worker = await next.fetch(page);
            expect(worker.status).toBe(200);
            expect(
              worker.headers
                .get("Content-Type")
                ?.includes("application/javascript")
            ).toBe(true);
          })
        );
      });
    }

    it("should render pages dir", async () => {
      const $ = await next.render("/");
      expect($("#welcome-text").text()).toBe("This is a Next.js PWA!");
      expect($("#app-root-text").text()).toBe("This is placed at _app.tsx!");
    });

    it("should render app dir", async () => {
      const $ = await next.render("/app-dir");
      expect($("#welcome-text").text()).toBe("This is a Next.js PWA!");
    });

    it("should render offline", async () => {
      const $ = await next.render("/~offline");
      expect($("#offline-text").text()).toBe("You are currently offline!");
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
