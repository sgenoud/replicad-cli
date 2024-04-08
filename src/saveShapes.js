import { parse as parsePath } from "https://deno.land/std@0.221.0/path/parse.ts";
import { join as joinPath } from "https://deno.land/std@0.221.0/path/join.ts";
import { JSZip } from "https://deno.land/x/jszip/mod.ts";
import { prettyProjection } from "./projectionView.js";

import builderAPI from "./builder.js";

const EXTS = new Map([
  ["stl-binary", "stl"],
  ["step-assembly", "step"],
]);
const mapExt = (ext) => {
  if (EXTS.has(ext)) return EXTS.get(ext);
  return ext;
};

export default async function saveShapes(
  inputShapes,
  output,
  fileType = "stl",
) {
  const outputPath = parsePath(output);

  if (fileType === "json") {
    await Deno.writeTextFile(
      joinPath(outputPath.dir, `${outputPath.name || "shapes"}.json`),
      JSON.stringify(builderAPI.exportJSONMeshInfo(inputShapes)),
    );
    return;
  }

  if (fileType === "svg-project") {
    await Deno.writeTextFile(
      joinPath(outputPath.dir, `${outputPath.name || "shapes"}.svg`),
      prettyProjection(inputShapes[0].shape),
    );
    return;
  }

  const shapes = await builderAPI.exportShapes(inputShapes, fileType);
  if (shapes.length === 1) {
    const { blob, name } = shapes[0];

    const ext = mapExt(fileType);
    const filename = outputPath.name || name || "shape";

    await Deno.writeTextFile(
      joinPath(outputPath.dir, `${filename}.${ext}`),
      await blob.text(),
    );
    return;
  }

  const zip = new JSZip();
  shapes.forEach((shape, i) => {
    zip.file(`${shape.name || `shape-${i}`}.${mapExt(fileType)}`, shape.blob);
  });
  const zipBlob = await zip.generateAsync({ type: "blob" });
  await Deno.writeTextFile(
    joinPath(outputPath.dir, `${outputPath.name || "shapes"}.zip`),
    await zipBlob.text(),
  );
}
