import * as replicad from "npm:replicad";

import initOpenCascade from "./initOCSingle.js";
import standardizeShapes from "./standardizeShapes.js";

import runCode from "./runCode.js";

self.replicad = replicad;

const isBlueprintLike = (shape) => {
  return (
    shape instanceof replicad.Blueprint ||
    shape instanceof replicad.Blueprints ||
    shape instanceof replicad.CompoundBlueprint ||
    shape instanceof replicad.Drawing
  );
};

function findHighlightedPart(
  { shape, highlight: inputHighlight, highlightEdge, highlightFace },
) {
  let highlight = inputHighlight ||
    (highlightEdge && highlightEdge(new replicad.EdgeFinder())) ||
    (highlightFace && highlightFace(new replicad.FaceFinder()));

  if (highlight) {
    try {
      return highlight.find(shape).map((s) => {
        return s.hashCode;
      });
    } catch (e) {
      console.error(e);
    }
  }
}

let OC = initOpenCascade().then((oc) => {
  return oc;
});

export function exportJSONMeshInfo(shapes) {
  return shapes.filter(
    ({ shape }) => !(shape instanceof replicad.Drawing) || shape.innerShape,
  )
    .map(
      ({
        name,
        shape,
        color,
        strokeType,
        opacity,
        highlight,
        highlightEdge,
        highlightFace,
      }) => {
        const shapeInfo = {
          name,
          color,
          strokeType,
          opacity,
        };

        if (isBlueprintLike(shape)) {
          shapeInfo.format = "svg";
          shapeInfo.paths = shape.toSVGPaths();
          shapeInfo.viewbox = shape.toSVGViewBox();
          return shapeInfo;
        }

        try {
          shapeInfo.mesh = shape.mesh({ tolerance: 0.1, angularTolerance: 30 });
          shapeInfo.edges = shape.meshEdges({ keepMesh: true });
        } catch (e) {
          console.error(e);
          shapeInfo.error = true;
          return shapeInfo;
        }

        const highlighted = findHighlightedPart({
          shape,
          highlight,
          highlightEdge,
          highlightFace,
        });
        if (highlighted) {
          shapeInfo.highlight = highlighted;
        }

        return shapeInfo;
      },
    );
}

const buildShapesFromCode = async (code, params) => {
  const oc = await OC;
  replicad.setOC(oc);

  let shapes;
  try {
    shapes = await runCode(code, params);
  } catch (e) {
    console.error(e);

    const message = e.message || `Kernel error ${e.toString()}`;

    return {
      error: true,
      message,
      stack: e.stack,
    };
  }

  return standardizeShapes(shapes);
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
  exportJSONMeshInfo,
  exportShapes,
};
