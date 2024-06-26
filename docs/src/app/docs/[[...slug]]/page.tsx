import { allDocs } from "contentlayer/generated";
import { getMDXComponent } from "next-contentlayer/hooks";
import { notFound } from "next/navigation";

import { TocProvider } from "@/shared/TocContext";
import { GITHUB_REPO_URL } from "@/shared/constants.js";
import { tocHeadingMdxComponents, tocMdxComponents } from "@/shared/mdxComponents.js";
import type { GenerateMetadata, PageComponent } from "@/shared/types.js";
import { clsx } from "@/utils/clsx.js";

export const generateStaticParams = async () => allDocs.map((post) => ({ slug: post._raw.flattenedPath.split("/") }));

export const generateMetadata: GenerateMetadata = ({ params }) => {
  const pagePath = params.slug?.join("/") ?? "";
  const post = allDocs.find((post) => post._raw.flattenedPath === pagePath);
  return {
    title: post?.title,
  };
};

const PostLayout: PageComponent = async ({ params }) => {
  const pagePath = params.slug?.join("/") ?? "";
  const post = allDocs.find((post) => post._raw.flattenedPath === pagePath);

  if (!post) {
    notFound();
  }

  const TableOfContents = getMDXComponent(post.headings);

  const Content = getMDXComponent(post.body.code);

  return (
    <TocProvider>
      <nav className="order-last hidden w-[350px] shrink-0 px-4 print:hidden xl:block" aria-label="Table of contents">
        <div className="sticky top-16 flex max-h-[calc(100vh-100px)] flex-col hyphens-auto pr-4 pt-6 text-sm ltr:-mr-4 rtl:-ml-4">
          <p className="mb-4 font-semibold tracking-tight text-black dark:text-white">On This Page</p>
          <div className="w-full self-stretch overflow-y-auto">
            <TableOfContents components={tocMdxComponents} />
          </div>
          <div className={clsx("sticky bottom-0 mt-8 flex flex-col items-start gap-2 border-t pb-8 pt-8", "dark:border-neutral-800")}>
            <a href={`${GITHUB_REPO_URL}/issues/new/choose`} target="_blank" rel="noreferrer" className="text-toc">
              Question? Give us feedback →<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a className="text-toc" href={`${GITHUB_REPO_URL}/tree/master/docs/content/${post._raw.sourceFilePath}`} target="_blank" rel="noreferrer">
              Edit this page →<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>
      </nav>
      <article className="w-full min-w-0 p-6 md:px-12 md:pb-12 xl:pt-12 flex flex-col">
        <Content components={tocHeadingMdxComponents} />
      </article>
    </TocProvider>
  );
};

export default PostLayout;
