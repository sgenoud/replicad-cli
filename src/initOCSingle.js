import opencascade from "npm:replicad-opencascadejs@0.16.0/src/replicad_single.js";
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
    path.join(import.meta.dirname,
      // this is a dirty hack that might break if the version of npm and here
      // are not in sync
      "./wasm/replicad_single.wasm",
    )
  });

  return OC;
};
