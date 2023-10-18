import { allDocs, type Docs } from "contentlayer/generated";
import { v4 as uuidv4 } from "uuid";

const treePriority: Record<string, string[]> = {
  "/docs": ["next-pwa"],
  "/docs/next-pwa": [
    "getting-started",
    "configuring",
    "custom-worker",
    "offline-fallbacks",
  ],
};

export interface DocsTree {
  id: string;
  title: string;
  url: string | undefined;
  children: DocsTree[];
}

interface BuildMapValue {
  id: string;
  // we use a Set to avoid duplications (due to the use of `treePriority`)
  childId: Set<string>;
  url: string | undefined;
  title: string;
}

const fallbackTitle = (title: string | undefined, url: string) =>
  title ?? url.slice(url.lastIndexOf("/") + 1);

const buildChildren = (
  docPath: string,
  buildMap: Record<string, BuildMapValue>
) => {
  const result: DocsTree[] = [];
  buildMap[docPath].childId.forEach((childPath) => {
    const childDocPath = `${docPath}/${childPath}`;
    const { id, title, url } = buildMap[childDocPath];
    result.push({
      id,
      title,
      url,
      children: buildChildren(childDocPath, buildMap),
    });
  });
  return result;
};

export const buildDocsTree = (docs: Docs[]): DocsTree[] => {
  const mapUrlToDoc: Record<string, Docs> = {};
  const docUrls: string[] = [];

  for (const doc of docs) {
    mapUrlToDoc[doc.url] = doc;
    docUrls.push(doc.url);
  }

  // map a segment to its id, title, url, and child segments.
  const map: Record<string, BuildMapValue> = {};

  for (const doc of docUrls) {
    // we split the path then add every segment to the map (if they do not exist)
    const splitted = doc.split("/");
    // splitted[0] is ""
    let currentPath = `/${splitted[1]}`;

    for (let i = 2; i < splitted.length; ++i) {
      const currentSegment = splitted[i];
      const parentPath = currentPath;

      if (!map[parentPath]) {
        const parentOnDocs = mapUrlToDoc[parentPath];

        map[parentPath] = {
          id: uuidv4(),
          title: fallbackTitle(parentOnDocs?.title, parentPath),
          url: parentOnDocs?.url,
          childId: new Set(treePriority[parentPath] ?? []),
        };
      }

      currentPath += `/${currentSegment}`;

      if (!map[currentPath]) {
        const id = uuidv4();

        map[parentPath].childId.add(currentSegment);

        const currentOnDocs = mapUrlToDoc[currentPath];

        map[currentPath] = {
          id,
          title: fallbackTitle(currentOnDocs?.title, currentPath),
          url: currentOnDocs?.url,
          childId: new Set(treePriority[currentPath] ?? []),
        };
      }
    }
  }

  const rootPath = "/docs";
  const rootMap = map[rootPath];

  return [
    {
      id: rootMap.id,
      title: rootMap.title,
      url: rootMap.url,
      children: [],
    },
    ...buildChildren(rootPath, map),
  ];
};

export const docsTree = buildDocsTree(allDocs);
