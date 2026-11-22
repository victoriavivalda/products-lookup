import { describe, expect, it } from "vitest";
import {
  buildSmoothBezierPath,
  getEngineColumnX,
  getRankRowY,
} from "./visibility-matrix.presenters";

describe("visibility-matrix SVG geometry utils", () => {
  it("calculates monotonically increasing X coordinates across engine columns", () => {
    const x0 = getEngineColumnX(0);
    const x1 = getEngineColumnX(1);
    const x2 = getEngineColumnX(2);

    expect(x0).toBeLessThan(x1);
    expect(x1).toBeLessThan(x2);
  });

  it("clamps ranks outside 1..3 range to valid chart bounds", () => {
    expect(getRankRowY(0)).toBe(getRankRowY(1));
    expect(getRankRowY(99)).toBe(getRankRowY(3));
    expect(getRankRowY(1)).toBeLessThan(getRankRowY(2));
  });

  it("generates valid SVG cubic bezier path commands", () => {
    const path = buildSmoothBezierPath([
      { x: 100, y: 40 },
      { x: 300, y: 90 },
    ]);

    expect(path).toBe("M 100 40 C 200 40, 200 90, 300 90");
  });
});
