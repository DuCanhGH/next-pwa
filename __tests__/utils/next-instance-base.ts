import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import * as cheerio from "cheerio";
import fsExtra from "fs-extra";
import type { PackageJson } from "type-fest";

export interface NextInstanceOpts {
  skipInstall: boolean;
  dependencies?: PackageJson["dependencies"];
}

export abstract class NextInstance {
  protected _isDestroyed: boolean;
  protected _testDir: string;
  protected _appTestDir: string;
  protected _url: string;
  protected _skipInstall: boolean;
  protected _cliOutput: string;
  protected _process: ChildProcessWithoutNullStreams | undefined;
  protected _dependencies: PackageJson["dependencies"] | undefined;
  constructor(opts: NextInstanceOpts) {
    this._isDestroyed = false;
    this._url = "";
    this._testDir = "";
    this._appTestDir = "";
    this._skipInstall = opts.skipInstall;
    this._cliOutput = "";
    this._process = undefined;
    this._dependencies = undefined;
  }
  public get cliOutput() {
    return this._cliOutput;
  }
  protected async createTestDir(sourceDir: string) {
    if (this._isDestroyed) {
      throw new Error("next instance already destroyed");
    }
    const tmpDir = await fs.realpath(os.tmpdir());

    this._testDir = path.join(
      tmpDir,
      `next-pwa-test-${Date.now()}-${(Math.random() * 1000) | 0}`
    );
    this._appTestDir = path.join(this._testDir, "__tests__");

    if (!existsSync(this._testDir)) {
      await fs.mkdir(this._testDir);
      await fs.mkdir(this._appTestDir);
    }

    console.log(
      `creating test directory with isolated next at ${this._testDir}...`
    );

    const packageJsonPath = path.join(sourceDir, "package.json");

    let packageJson: PackageJson | undefined;

    if (existsSync(packageJsonPath)) {
      packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));
    }

    this._dependencies = {
      next: require("next/package.json").version,
      react: "latest",
      "react-dom": "latest",
      typescript: "latest",
      "@types/node": "latest",
      "@types/react": "latest",
      "@types/react-dom": "latest",
      ...this._dependencies,
      ...packageJson?.dependencies,
    };

    await fs.writeFile(
      path.join(this._appTestDir, "package.json"),
      JSON.stringify(
        {
          ...packageJson,
          dependencies: this._dependencies,
        },
        null,
        2
      )
    );

    const origRepoDir = path.join(__dirname, "../..");

    const copyRepoPromise: Promise<any>[] = [];

    for (const dir of [
      "packages",
      "package.json",
      "pnpm-workspace.yaml",
      "tsconfig.json",
    ]) {
      const resolvedPath = path.join(origRepoDir, dir);
      if (existsSync(resolvedPath)) {
        copyRepoPromise.push(
          fsExtra.copy(resolvedPath, path.join(this._testDir, dir), {
            filter: (item) => {
              return (
                !item.includes("node_modules") &&
                !item.includes("pnpm-lock.yaml") &&
                !item.includes(".DS_Store")
              );
            },
          })
        );
      }
    }

    await Promise.all(copyRepoPromise);

    console.log("installing dependencies...");

    await new Promise<void>((resolve, reject) => {
      exec(
        `pnpm i --no-frozen-lockfile`,
        { cwd: this._testDir },
        (error, stdout, stderr) => {
          if (error) {
            console.error(
              `failed to install dependencies: ${JSON.stringify(
                error,
                null,
                2
              )}`
            );
            reject();
          } else {
            console.log(
              `installed dependencies successfully with stdout: ${
                stdout || "none"
              } and stderr: ${stderr || "none"}`
            );
            resolve();
          }
        }
      );
    });

    const copyFilePromise: Promise<any>[] = [];

    for (const dir of ["app", "pages", "public"]) {
      const resolvedPath = path.join(sourceDir, dir);
      if (existsSync(resolvedPath)) {
        copyFilePromise.push(
          fs.cp(resolvedPath, path.join(this._appTestDir, dir), {
            recursive: true,
          })
        );
      }
    }

    for (const file of ["next.config.js", "next.config.mjs", "tsconfig.json"]) {
      const resolvedPath = path.join(sourceDir, file);
      if (existsSync(resolvedPath)) {
        copyFilePromise.push(
          fs.copyFile(resolvedPath, path.join(this._appTestDir, file))
        );
      }
    }

    await Promise.all(copyFilePromise);
  }
  protected async clean() {
    try {
      await fs.rm(this._testDir, {
        recursive: true,
        force: true,
        maxRetries: 10,
      });
    } catch (err) {
      console.error(`failed to clean up: ${JSON.stringify(err, null, 2)}`);
    }
  }
  abstract setup(sourceDir: string): Promise<void>;
  abstract spawn(): Promise<void>;
  public async destroy() {
    if (this._isDestroyed) {
      throw new Error("next instance already destroyed");
    }
    this._isDestroyed = true;
    let exitResolve: () => void;
    const exitPromise = new Promise<void>((resolve) => {
      exitResolve = resolve;
    });
    this._process?.addListener("exit", () => exitResolve());
    this._process?.kill();
    await exitPromise;
    this._process = undefined;
    await this.clean();
  }
  public async fetch(pathname: string, init?: RequestInit) {
    if (this._url === "") {
      throw new Error("fetch error: base url not defined.");
    }
    return await fetch(new URL(pathname, this._url), init);
  }
  public async render(pathname: string, init?: RequestInit) {
    return cheerio.load(await (await this.fetch(pathname, init)).text());
  }
}
