import opencascade from "npm:replicad-opencascadejs/src/replicad_single.js";
import fs from "node:fs";
import path from "node:path";

globalThis.__dirname = import.meta.dirname;
globalThis.require = (module) => {
  if (module === "fs") return fs;
  if (module === "path") return path;
};

export default async () => {
  const OC = await opencascade({
    locateFile: () =>
      "./node_modules/replicad-opencascadejs/src/replicad_single.wasm",
  });

  return OC;
};
