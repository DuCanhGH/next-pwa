import type { SpawnOptionsWithoutStdio } from "node:child_process";
import { spawn } from "node:child_process";

import { NextInstance } from "./next-instance-base";

export class NextInstanceDev extends NextInstance {
  public async setup(sourceDir: string) {
    await this.createTestDir(sourceDir);
  }
  public async spawn() {
    const spawnOpts: SpawnOptionsWithoutStdio = {
      cwd: this._appTestDir,
      shell: false,
      env: {
        ...process.env,
        NODE_ENV: "" as any,
        PORT: "0",
      },
    };

    console.log("running next dev...");

    return new Promise<void>((resolve) => {
      try {
        this._process = spawn("pnpm", ["next", "dev"], spawnOpts);
        this._process.stdout.on("data", (chunk: Buffer) => {
          const msg = chunk.toString();
          this._cliOutput += msg;
          if (msg.includes("started server on") && msg.includes("url:")) {
            this._url = msg.split("url: ").pop()?.split(/\s/)[0].trim() ?? "";
            resolve();
          }
        });
        this._process.stderr.on("data", (chunk: Buffer) => {
          const msg = chunk.toString();
          this._cliOutput += msg;
        });
      } catch (err) {
        console.error(`next spawn failed: ${JSON.stringify(err, null, 2)}`);
      }
    });
  }
}
