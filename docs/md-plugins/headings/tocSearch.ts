import Slugger from "github-slugger";
import type { Heading } from "mdast";
import { convert } from "unist-util-is";
import { visit } from "unist-util-visit";

import { toExpression } from "./tocToExpression.js";
import type {
  Node,
  SearchEntry,
  SearchOptions,
  SearchResult,
} from "./types.js";
import { getNodeAsString } from "./utils.js";

const slugs = new Slugger();

/**
 * Search a node for a ToC.
 *
 * @param root
 * @param expression
 * @param settings
 * @returns
 */
export const search = (
  root: Node,
  expression: RegExp | undefined,
  settings: SearchOptions
): SearchResult => {
  const skip = settings.skip ? toExpression(settings.skip) : undefined;
  const parents = convert(settings.parents || ((d) => d === root));
  const map: SearchEntry[] = [];
  let index: number | undefined;
  let endIndex: number | undefined;
  let opening: Heading | undefined;

  slugs.reset();

  // Visit all headings in `root`.  We `slug` all headings (to account for
  // duplicates), but only create a TOC from top-level headings (by default).
  visit(root, "heading", (node, position, parent) => {
    const value = getNodeAsString(node);
    const id: string =
      // @ts-expect-error `hProperties` from <https://github.com/syntax-tree/mdast-util-to-hast>
      node.data && node.data.hProperties && node.data.hProperties.id;
    const slug = slugs.slug(id || value);

    if (!parents(parent)) {
      return;
    }

    // Our opening heading.
    if (position && expression && !index && expression.test(value)) {
      index = position + 1;
      opening = node;
      return;
    }

    // Our closing heading.
    if (
      position !== null &&
      opening &&
      !endIndex &&
      node.depth <= opening.depth
    ) {
      endIndex = position;
    }

    // A heading after the closing (if we were looking for one).
    if (
      (endIndex || !expression) &&
      (!settings.maxDepth || node.depth <= settings.maxDepth) &&
      (!skip || !skip.test(value))
    ) {
      map.push({ depth: node.depth, children: node.children, id: slug });
    }
  });

  return {
    index: index === undefined ? -1 : index,
    endIndex:
      index === undefined ? -1 : endIndex || (root as any).children.length,
    map,
  };
};
