const simplify = require('simplify-svg');
const extract = require('extract-svg-path');
const svgpath = require('svgpath');

const PLUGINS = [
  simplify.Plugins.cleanupAttrs,
  simplify.Plugins.cleanupIDs,
  simplify.Plugins.removeComments,
  simplify.Plugins.removeDefs,
  simplify.Plugins.removeEmpties,
  simplify.Plugins.removeTransform,
];

function parseAndSimplifySvg(svg) {
  return svgpath(extract.parse(simplify.default(svg, PLUGINS)));
}

function getMinMax(path) {
  let min = { x: null, y: null };
  let max = { x: null, y: null };

  path.iterate((segment, index, x, y) => {
    if (segment[0] === 'M') {
      return;
    }
    if (min.x === null || x < min.x) { min.x = x; }
    if (min.y === null || y < min.y) { min.y = y; }
    if (max.x === null || x > max.x) { max.x = x; }
    if (max.y === null || y > max.y) { max.y = y; }
  });

  return [min, max];
}

function calculateRatio(path) {
  const [min, max] = getMinMax(path);

  let ratio = 1.0;

  if (max.x > max.y) {
    return 100 / max.x;
  } else {
    return 100 / max.y;
  }
}

function center(path) {
  const [min, max] = getMinMax(path);

  if (max.x >= max.y) {
    path = path.translate(0.0, (100 - max.y) / 2.0);
  } else {
    path = path.translate((100 - max.x) / 2.0, 0);
  }

  // return path.translate(-50, -50);
  return path;
}

function normalize(path) {
  const [min, max] = getMinMax(path);
  path = path.translate(-min.x, -min.y);
  const ratio = calculateRatio(path);
  return path.scale(ratio, ratio);
}

module.exports = function normalizeSvgIcon(source) {
  const path = parseAndSimplifySvg(source);
  return center(normalize(path)).round(5).toString();
}
