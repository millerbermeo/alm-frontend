import { describe, expect, it } from "vitest";

import { buildFolderTree, flattenTree } from "./tree";
import type { Folder } from "@/types/api";

function folder(id: string, name: string, parent_id: string | null): Folder {
  return {
    id,
    project_id: "p",
    parent_id,
    name,
    path: `/${name}`,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

describe("buildFolderTree", () => {
  const flat = [
    folder("1", "products", null),
    folder("2", "summer", "1"),
    folder("3", "banners", null),
    folder("4", "winter", "1"),
  ];

  it("nests children under their parent and sorts by name", () => {
    const roots = buildFolderTree(flat);
    expect(roots.map((r) => r.folder.name)).toEqual(["banners", "products"]);
    const products = roots.find((r) => r.folder.id === "1")!;
    expect(products.children.map((c) => c.folder.name)).toEqual(["summer", "winter"]);
    expect(products.children[0]!.depth).toBe(1);
  });

  it("treats an orphan (missing parent) as a root", () => {
    const roots = buildFolderTree([folder("x", "orphan", "missing")]);
    expect(roots).toHaveLength(1);
    expect(roots[0]!.folder.name).toBe("orphan");
  });

  it("flattenTree yields a depth-first ordered list", () => {
    const flatOut = flattenTree(buildFolderTree(flat));
    expect(flatOut.map((n) => n.folder.name)).toEqual([
      "banners",
      "products",
      "summer",
      "winter",
    ]);
  });
});
