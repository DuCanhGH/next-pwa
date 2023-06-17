import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { spawn } from "node:child_process";
import path from "node:path";

import * as cheerio from "cheerio";

jest.setTimeout(120 * 1000);

describe("e2e app-dir", () => {
  let nextProcess: ChildProcessWithoutNullStreams;
  let url: string | undefined;

  beforeAll(async () => {
    const spawnNext = async () => {
      return new Promise<void>((resolve) => {
        nextProcess = spawn("pnpm", ["dev", __dirname], {
          cwd: path.join(__dirname, "../.."),
        });
        nextProcess.stdout.on("data", (chunk: Buffer) => {
          const msg = chunk.toString();
          if (msg.includes("started server on") && msg.includes("url:")) {
            url = msg.split("url: ").pop()?.split(/\s/)[0].trim();
            resolve();
          }
        });
      });
    };
    await spawnNext();
  });

  it("should render", async () => {
    if (!url) {
      throw new Error("URL not defined.");
    }
    const $ = cheerio.load(await (await fetch(url)).text());
    expect($("#welcome-text").text()).toBe("This is a Next.js PWA!");
  });

  it("should fetch image", async () => {
    if (!url) {
      throw new Error("URL not defined.");
    }
    const image = await fetch(`${url}/next.svg`);
    expect(image.status).toBe(200);
  });

  afterAll(() => {
    nextProcess.kill();
  });
});
