const shapeOrSketch = (shape) => {
  if (!(shape instanceof replicad.Sketch)) return shape;
  if (shape.wire.isClosed) return shape.face();
  return shape.wire;
};

export const standardizeListOfShape = (inputShapes, baseName = "Shape") => {
  let shapes = inputShapes;

  if (!Array.isArray(shapes)) shapes = [shapes];

  return shapes.map((inputShape, i) => {
    if (!inputShape.shape) {
      return {
        name: `${baseName} ${i}`,
        shape: shapeOrSketch(inputShape),
      };
    }
    const { name, shape, ...rest } = inputShape;

    return {
      name: name || `${baseName} ${i}`,
      shape: shapeOrSketch(shape),
      ...rest,
    };
  });
};

export const normalizeColorAndOpacity = (shapes) => {
  return shapes.map((shape) => {
    const { color, opacity, ...rest } = shape;

    const normalizedColor = color && normalizeColor(color);
    let configuredOpacity = opacity;
    if (normalizedColor && normalizedColor.alpha !== 1) {
      configuredOpacity = opacity ?? normalizedColor.alpha;
    }

    return {
      ...rest,
      color: normalizedColor?.color,
      opacity: configuredOpacity,
    };
  });
};

export default function standardizeShapes(shapes, baseName) {
  return normalizeColorAndOpacity(standardizeListOfShape(shapes, baseName));
}
