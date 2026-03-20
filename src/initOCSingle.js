import fs from "node:fs";
import path from "node:path";

globalThis.require = (module) => {
  if (module === "fs") return fs;
  if (module === "path") return path;
};

const OC_PKG = "replicad-opencascadejs";
const OC_VER = "0.20.0";

// Resolve Deno's npm cache so the Emscripten module can find its own WASM.
// The npm package reads __dirname at load time to locate the .wasm file,
// but Deno doesn't polyfill __dirname for npm ESM, so we point it at
// the cached package directory before dynamically importing the module.
function getDenoDir() {
  const env = Deno.env.get("DENO_DIR");
  if (env) return env;
  const home = Deno.env.get("HOME") || Deno.env.get("USERPROFILE") || "";
  switch (Deno.build.os) {
    case "darwin":
      return path.join(home, "Library/Caches/deno");
    case "linux":
      return path.join(home, ".cache/deno");
    case "windows":
      return path.join(Deno.env.get("LOCALAPPDATA") || home, "deno");
  }
}

export default async () => {
  const npmPkgDir = path.join(
    getDenoDir(),
    "npm/registry.npmjs.org",
    OC_PKG,
    OC_VER,
    "src",
  );
  globalThis.__dirname = npmPkgDir;

  const { default: opencascade } = await import(
    `npm:${OC_PKG}@${OC_VER}/src/replicad_single.js`
  );
  const OC = await opencascade();

  return OC;
};
