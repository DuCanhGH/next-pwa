import extend from "extend";
import type { List, ListItem, PhrasingContent } from "mdast";

import type { ContentsOptions, SearchEntry } from "./types.js";

/**
 * Insert an entry into `parent`.
 *
 * @param entry
 * @param parent
 * @param settings
 */
const insert = (
  entry: SearchEntry,
  parent: List | ListItem,
  settings: ContentsOptions
) => {
  let index = -1;
  const tail = parent.children[parent.children.length - 1];

  if (parent.type === "list") {
    if (entry.depth === 1) {
      parent.children.push({
        type: "listItem",
        spread: false,
        children: [
          {
            type: "paragraph",
            children: [
              {
                type: "link",
                title: null,
                url: "#" + entry.id,
                children: all(entry.children),
              },
            ],
          },
        ],
      });
    } else if (parent.children.length > 0) {
      const tail = parent.children[parent.children.length - 1];
      insert(entry, tail, settings);
    } else {
      const item: ListItem = { type: "listItem", spread: false, children: [] };
      parent.children.push(item);
      insert(entry, item, settings);
    }
  }
  // List item
  else if (tail && tail.type === "list") {
    entry.depth--;
    insert(entry, tail, settings);
  } else {
    const item: List = {
      type: "list",
      ordered: settings.ordered,
      spread: false,
      children: [],
    };
    parent.children.push(item);
    entry.depth--;
    insert(entry, item, settings);
  }

  if (parent.type === "list" && !settings.tight) {
    parent.spread = false;

    while (++index < parent.children.length) {
      if (parent.children[index].children.length > 1) {
        parent.spread = true;
        break;
      }
    }
  } else {
    parent.spread = !settings.tight;
  }
};

/**
 * @param nodes
 * @returns
 */
const all = (nodes?: PhrasingContent[]) => {
  let result: PhrasingContent[] = [];
  let index = -1;

  if (nodes) {
    while (++index < nodes.length) {
      result = result.concat(one(nodes[index]));
    }
  }

  return result;
};

/**
 * @param node
 * @returns
 */
const one = (node: PhrasingContent): PhrasingContent | PhrasingContent[] => {
  if (node.type === "footnoteReference") {
    return [];
  }

  if (node.type === "link" || node.type === "linkReference") {
    return all(node.children);
  }

  if ("children" in node) {
    const { children, position, ...copy } = node;
    return Object.assign(extend(true, {}, copy), {
      children: all(node.children),
    });
  }

  const { position, ...copy } = node;
  return extend(true, {}, copy);
};

/**
 * Transform a list of heading objects to a markdown list.
 *
 * @param map
 * @param settings
 */
export const contents = (map: SearchEntry[], settings: ContentsOptions) => {
  const { ordered = false, tight = false } = settings;
  const table: List = { type: "list", ordered, spread: false, children: [] };
  let minDepth = Number.POSITIVE_INFINITY;
  let index = -1;

  // Find minimum depth.
  while (++index < map.length) {
    if (map[index].depth < minDepth) {
      minDepth = map[index].depth;
    }
  }

  // Normalize depth.
  index = -1;

  while (++index < map.length) {
    map[index].depth -= minDepth - 1;
  }

  // Add TOC to list.
  index = -1;

  while (++index < map.length) {
    insert(map[index], table, { ordered, tight });
  }

  return table;
};
