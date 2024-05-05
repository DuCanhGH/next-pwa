import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { LegacyRef } from "react";
import { twMerge } from "tailwind-merge";

import { Callout } from "@/components/Callout.js";
import { Code } from "@/components/Code.js";
import { Heading } from "@/components/Heading.js";
import { InlineCode } from "@/components/InlineCode.js";
import { AnchorLinkUnderline } from "@/components/Link/AnchorLinkUnderline.js";
import { LinkUnderline } from "@/components/Link/LinkUnderline.js";
import { Tabs } from "@/components/Tabs/index.js";
import { Text } from "@/components/Text.js";
import { clsx } from "@/utils/clsx.js";
import { TocHeading, TocLink } from "./TocContext";

const TEXT_COLOR = "text-black dark:text-white";
const TEXT_BORDER = "border-b border-neutral-200/70 dark:border-neutral-400/10";

const filterLegacyRef = <T,>(ref: LegacyRef<T> | undefined) => (typeof ref === "string" ? undefined : ref);

export const mdxComponents: MDXComponents = {
  InlineCode,
  Callout,
  Tabs,
  a: ({ href, className, ref, ...rest }) => {
    // Hash URLs
    if (href?.startsWith("#")) {
      return (
        <a
          href={href}
          className={twMerge(
            "text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100",
            className,
          )}
          ref={ref}
          {...rest}
        />
      );
    }

    // Same origin
    if (href?.startsWith("/")) {
      return <LinkUnderline href={href} className={className} ref={filterLegacyRef(ref)} {...rest} />;
    }

    return <AnchorLinkUnderline href={href} className={className} target="_blank" rel="noopener noreferrer" ref={filterLegacyRef(ref)} {...rest} />;
  },
  p: ({ ref, className, ...rest }) => <Text ref={filterLegacyRef(ref)} className={clsx("mt-6", className)} {...rest} />,
  h1: ({ ref, ...rest }) => <Heading type="display" ref={filterLegacyRef(ref)} {...rest} />,
  h2: ({ className, ref, ...rest }) => <Heading type="title-large" ref={filterLegacyRef(ref)} className={clsx(TEXT_BORDER, className)} {...rest} />,
  h3: ({ ref, ...rest }) => <Heading type="title" ref={filterLegacyRef(ref)} {...rest} />,
  h4: ({ ref, ...rest }) => <Heading type="subtitle" ref={filterLegacyRef(ref)} {...rest} />,
  code: ({ ref, ...rest }) => <InlineCode ref={ref} {...rest} />,
  pre: ({ ref, children, ...rest }) => {
    return (
      <Code {...rest}>
        <span>{children}</span>
      </Code>
    );
  },
  ul: ({ className, ...rest }) => <ul className={twMerge("list-disc first:mt-0 ltr:ml-6 rtl:mr-6", className)} {...rest} />,
  li: ({ className, ...rest }) => <li className={twMerge("my-4 break-words [&>*]:!my-0 [&>ul]:pl-1", TEXT_COLOR, className)} {...rest} />,
};

export const tocHeadingMdxComponents: MDXComponents = {
  ...mdxComponents,
  h1: ({ ref, ...rest }) => <TocHeading type="display" {...rest} />,
  h2: ({ className, ref, ...rest }) => <TocHeading type="title-large" className={clsx(TEXT_BORDER, className)} {...rest} />,
  h3: ({ ref, ...rest }) => <TocHeading type="title" {...rest} />,
  h4: ({ ref, ...rest }) => <TocHeading type="subtitle" {...rest} />,
};

export const tocMdxComponents: MDXComponents = {
  ...mdxComponents,
  ul({ className, ...rest }) {
    return <ul className="list mt-2" {...rest} />;
  },
  li({ ...rest }) {
    return <li {...rest} />;
  },
  p({ children }) {
    return <>{children}</>;
  },
  a({ ref, ...rest }) {
    return <TocLink {...rest} />;
  },
};
