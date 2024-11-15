import * as replicad from "npm:replicad@0.17.3";

import initOpenCascade from "./initOCSingle.js";
import {
  standardizeOutput,
  ShapeStandardizer,
  renderAsJSON,
} from "./renderOutput.ts";

import runCode from "./runCode.js";

self.replicad = replicad;
globalThis.registerShapeStandardizer = () => {};

let OC = initOpenCascade().then((oc) => {
  return oc;
});

const buildShapesFromCode = async (code, params) => {
  const oc = await OC;
  replicad.setOC(oc);

  let shapes;
  const standardizer = new ShapeStandardizer();
  try {
    globalThis.registerShapeStandardizer =
      standardizer.registerAdapter.bind(standardizer);

    console.log("running code");
    shapes = await runCode(oc, code, params);
  } catch (e) {
    console.error(e);

    const message = e.message || `Kernel error ${e.toString()}`;

    return {
      error: true,
      message,
      stack: e.stack,
    };
  }

  return standardizeOutput(shapes, standardizer);
};

const buildBlob = (
  shape,
  fileType,
  meshConfig = {
    tolerance: 0.01,
    angularTolerance: 30,
  },
) => {
  if (fileType === "stl") {
    const b = shape.blobSTL(meshConfig);
    return b;
  }
  if (fileType === "stl-binary") {
    return shape.blobSTL({ ...meshConfig, binary: true });
  }
  if (fileType === "step") return shape.blobSTEP();
  throw new Error(`Filetype "${fileType}" unknown for export.`);
};

const exportShapes = (
  shapes,
  fileType = "stl",
  shapeId = "defaultShape",
  meshConfig,
) => {
  if (fileType === "step-assembly") {
    return [
      {
        blob: replicad.exportSTEP(shapes),
        name: shapeId,
      },
    ];
  }
  return shapes.map(({ shape, name }) => ({
    blob: buildBlob(shape, fileType, meshConfig),
    name,
  }));
};

export const ready = () => OC.then(() => true);

export default {
  buildShapesFromCode,
  exportJSONMeshInfo: renderAsJSON,
  exportShapes,
};
