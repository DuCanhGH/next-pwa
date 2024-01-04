import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { bundleMDX } from "mdx-bundler";
import { Inter } from "next/font/google";
import Link from "next/link";
import { getMDXComponent } from "next-contentlayer/hooks";

import { InlineCode } from "@/components/InlineCode.js";
import { Text } from "@/components/Text.js";
import { mdxComponents } from "@/shared/mdxComponents.js";
import { clsx } from "@/utils/clsx.js";

import {
  rehypePlugins,
  remarkPlugins,
} from "../../../contentlayer.constants.js";
import { CodeShowcase } from "./components.js";
import { FEATURES_LIST } from "./constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const inter = Inter({ subsets: ["latin"] });

const Page = async () => {
  const text = await fs.readFile(
    path.join(__dirname, "./code-showcase.mdx"),
    "utf-8"
  );
  const compiledText = await bundleMDX({
    source: text,
    mdxOptions(opts) {
      opts.rehypePlugins = [...(opts.rehypePlugins ?? []), ...rehypePlugins];
      opts.remarkPlugins = [...(opts.remarkPlugins ?? []), ...remarkPlugins];
      return opts;
    },
  });
  const RenderedCodeShowcase = getMDXComponent(compiledText.code);

  return (
    <div
      className={clsx(
        "w-full self-stretch",
        "bg-white text-black dark:bg-black dark:text-white",
        inter.className
      )}
    >
      <div className="flex w-full flex-col items-center justify-center gap-5 px-5 py-40">
        <h1
          className={clsx(
            "my-2 text-balance text-center text-5xl font-extrabold tracking-tight",
            "bg-gradient-to-t from-gray-500 to-black bg-clip-text text-transparent dark:from-gray-400 dark:to-white"
          )}
        >
          Make performant web apps with Next.js & PWA.
        </h1>
        <h2 className="my-2 text-balance text-center text-2xl font-medium tracking-tight opacity-80">
          <InlineCode>next-pwa</InlineCode> enables you to create PWAs with
          Next.js. No configuration needed, yet so configurable.
        </h2>
        <Link
          href="/docs/next-pwa/getting-started"
          className={clsx(
            "rounded-md border px-6 py-3 font-bold transition-colors duration-100",
            "bg-black text-white dark:bg-white dark:text-black",
            "hover:border-black hover:bg-white hover:text-black",
            "hover:dark:border-white hover:dark:bg-black hover:dark:text-white",
            "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          )}
        >
          Get started
        </Link>
        <InlineCode>
          npx create-next-app@latest -e
          https://github.com/DuCanhGH/next-pwa/tree/master/examples/basic
        </InlineCode>
      </div>
      <div className="w-full p-4 md:p-24">
        <div className="grid w-full text-left lg:mb-0 lg:grid-cols-4 lg:gap-2">
          {FEATURES_LIST.map((feature, idx) => (
            <div
              key={`homepage-feature-lists-${idx}`}
              className={clsx(
                "rounded-lg border border-transparent px-5 py-4 transition-colors",
                "hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              )}
            >
              <h2 className="mb-3 text-2xl font-semibold">
                {feature.icon} {feature.label}
              </h2>
              <p className="m-0 max-w-[30ch] text-sm opacity-80">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full p-4 md:p-24">
        <RenderedCodeShowcase
          components={{
            ...mdxComponents,
            CodeShowcase,
            p: ({ ref, className, ...rest }) => (
              <Text className={clsx("mt-6 text-xl", className)} {...rest} />
            ),
          }}
        />
      </div>
    </div>
  );
};

export default Page;
