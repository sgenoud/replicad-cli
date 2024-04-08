import { draw, drawProjection, ProjectionCamera } from "npm:replicad";

function parseViewbox(viewbox) {
  if (!viewbox) return {};
  const [x, y, width, height] = viewbox.split(" ").map((v) => parseFloat(v));
  return { xMin: x, yMin: y, xMax: x + width, yMax: y + height, width, height };
}

function mergeViewboxes(viewboxes) {
  const [xMin, yMin, xMax, yMax] = viewboxes.reduce(
    (acc, box) => {
      const [x1, y1, x2, y2] = acc;
      const { xMin, yMin, xMax, yMax } = parseViewbox(box);
      return [
        Math.min(xMin, x1),
        Math.min(yMin, y1),
        Math.max(xMax, x2),
        Math.max(yMax, y2),
      ];
    },
    [Infinity, Infinity, -Infinity, -Infinity],
  );

  return { xMin, yMin, xMax, yMax, width: xMax - xMin, height: yMax - yMin };
}

const stringifyViewbox = ({ xMin, yMin, xMax, yMax }) => {
  return [
    xMin.toFixed(2),
    yMin.toFixed(2),
    (xMax - xMin).toFixed(2),
    (yMax - yMin).toFixed(2),
  ].join(" ");
};

const mainSVG = (viewbox, body) => {
  return `<svg 
     version="1.1" 
     xmlns="http://www.w3.org/2000/svg" 
     viewBox="${viewbox}" 
     fill="none" 
     stroke="black" 
     stroke-width="0.2%" 
     vector-effect="non-scaling-stroke">
  ${body}
  </svg>`;
}

const writeSVG = (visible, hidden) => {
  const visiblePath = `<path d="${visible.toSVGPaths().flat(Infinity).join(" ")}" />`

  if (!hidden) {
    return mainSVG(visible.toSVGViewBox(), visiblePath)
  }

  const viewbox = stringifyViewbox(mergeViewboxes([
    visible.toSVGViewBox(),
    hidden.toSVGViewBox(),
  ]));

  const hiddenPath = `<path 
    stroke-dasharray="1,1"
    opacity="0.1"
    d="${hidden.toSVGPaths().flat(Infinity).join(" ")}" />
  `;

  return mainSVG(viewbox, [visiblePath, hiddenPath].join("\n"))
}

export const prettyProjection = (shape, withHidden = false) => {
  const bbox = shape.boundingBox;
  const center = bbox.center;

  const maxSide = Math.max(bbox.width, bbox.height, bbox.depth);

  const corner = [
    bbox.center[0] + maxSide,
    bbox.center[1] - maxSide,
    bbox.center[2] + maxSide,
  ];
  const camera = new ProjectionCamera(corner).lookAt(center);
  const { visible, hidden } = drawProjection(shape, camera);

  return writeSVG(visible, withHidden ? hidden: undefined)
};
