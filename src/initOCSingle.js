import opencascade from "npm:replicad-opencascadejs@0.16.0/src/replicad_single.js";
import fs from "node:fs";
import path from "node:path";

globalThis.__dirname = import.meta.dirname;
globalThis.require = (module) => {
  if (module === "fs") return fs;
  if (module === "path") return path;
};

export default async () => {
  const wasmFile = import.meta.resolve("./wasm/replicad_single.wasm");
  const wasmBinary = await fetch(wasmFile).then((r) => r.arrayBuffer());

  const OC = await opencascade({ wasmBinary });

  return OC;
};
