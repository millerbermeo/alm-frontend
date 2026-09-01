import type { Folder } from "@/types/api";

export interface FolderNode {
  folder: Folder;
  depth: number;
  children: FolderNode[];
}

/** Build a nested tree from the flat, path-ordered folder list. */
export function buildFolderTree(folders: Folder[]): FolderNode[] {
  const byId = new Map<string, FolderNode>();
  for (const folder of folders) byId.set(folder.id, { folder, depth: 0, children: [] });

  const roots: FolderNode[] = [];
  for (const node of byId.values()) {
    const parentId = node.folder.parent_id;
    const parent = parentId ? byId.get(parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  const sortRec = (nodes: FolderNode[], depth: number) => {
    nodes.sort((a, b) => a.folder.name.localeCompare(b.folder.name));
    for (const n of nodes) {
      n.depth = depth;
      sortRec(n.children, depth + 1);
    }
  };
  sortRec(roots, 0);
  return roots;
}

/** Flatten a tree back to an ordered list (for indented rendering / selects). */
export function flattenTree(nodes: FolderNode[]): FolderNode[] {
  const out: FolderNode[] = [];
  const walk = (list: FolderNode[]) => {
    for (const n of list) {
      out.push(n);
      walk(n.children);
    }
  };
  walk(nodes);
  return out;
}
