// Source (MIT): https://github.com/rehypejs/rehype-slug
import Slugger from "github-slugger";
import type { Root } from "hast";
import { hasProperty } from "hast-util-has-property";
import { headingRank } from "hast-util-heading-rank";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

import { getNodeAsString } from "./utils.js";

const slugs = new Slugger();

/**
 * Plugin to add `id`s to headings.
 */
const rehypeSlug: Plugin<any[], Root> = () => {
  return (tree: Root) => {
    slugs.reset();

    visit(tree, "element", (node) => {
      if (
        headingRank(node as any) &&
        node.properties &&
        !hasProperty(node, "id")
      ) {
        node.properties.id = slugs.slug(getNodeAsString(node));
      }
    });
  };
};

export default rehypeSlug;
