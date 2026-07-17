/* global window */
/* Domain helpers for the light beam / shadow / brightness scene. */

// Straight beam from a light origin to a wall x-position, as an SVG polygon
// (a cone widening slightly), plus the centre ray endpoint. Light never bends —
// callers never vary this by "angle" beyond the origin's fixed position.
function beamPolygonPoints(originX, originY, wallX, halfSpread) {
  const spread = halfSpread == null ? 90 : halfSpread;
  const topX = wallX;
  const topY = originY - spread;
  const botX = wallX;
  const botY = originY + spread;
  return `${originX},${originY} ${topX},${topY} ${botX},${botY}`;
}

// Shadow width on the wall grows as the blocking object moves closer to the
// light (similar-triangles projection): shadowW = objW * (lightToWall / lightToObj).
function shadowWidth(objW, lightToObjDist, lightToWallDist) {
  if (lightToObjDist <= 0) return objW;
  const ratio = lightToWallDist / lightToObjDist;
  return Math.max(objW, objW * ratio);
}

// Brightness 0..1 -> room overlay darkness opacity (0 = fully lit, 0.85 = near-dark).
function brightnessToOverlayOpacity(brightness01) {
  const b = Math.max(0, Math.min(1, brightness01));
  return 0.85 * (1 - b);
}

// Simple rectangle hit-test, shared by every drag interaction on this applet.
function pointInRect(x, y, rect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

// Convert a pointer/touch clientX/Y into the 1920x1080 local coordinate space,
// accounting for --scaleFactor and the wrapper's on-screen position.
function screenToLocal(clientX, clientY, wrapperEl) {
  const rect = wrapperEl.getBoundingClientRect();
  const scale = rect.width / 1920;
  return {
    x: (clientX - rect.left) / scale,
    y: (clientY - rect.top) / scale,
  };
}

window.lightScene = {
  beamPolygonPoints,
  shadowWidth,
  brightnessToOverlayOpacity,
  pointInRect,
  screenToLocal,
};
