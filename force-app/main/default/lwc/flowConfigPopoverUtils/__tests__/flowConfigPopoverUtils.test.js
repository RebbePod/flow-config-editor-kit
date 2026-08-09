import {
  createPopoverState,
  positionAnchoredPopover
} from "c/flowConfigPopoverUtils";

function elementWithRect(rect, scrollHeight = 0) {
  return {
    scrollHeight,
    getBoundingClientRect: () => rect
  };
}

describe("flowConfigPopoverUtils", () => {
  it("opens above the anchor and grows for a wrapped breadcrumb header", () => {
    const anchor = elementWithRect({
      left: 100,
      top: 600,
      bottom: 640,
      width: 400
    });
    const popover = elementWithRect({ width: 0 });
    const header = elementWithRect({ height: 72 }, 72);
    const scrollArea = elementWithRect({}, 500);

    const positioned = positionAnchoredPopover({
      anchor,
      popover,
      header,
      scrollArea,
      viewportWidth: 1000,
      viewportHeight: 700
    });

    expect(positioned.state.openAbove).toBe(true);
    expect(positioned.style).toContain("height:416px");
    expect(positioned.style).toContain("top:180px");
  });

  it("corrects fixed positioning inside a transformed Flow Builder panel", () => {
    const anchor = elementWithRect({
      left: 300,
      top: 500,
      bottom: 540,
      width: 320
    });
    const header = elementWithRect({ height: 36 }, 36);
    const scrollArea = elementWithRect({}, 200);
    const initial = positionAnchoredPopover({
      anchor,
      popover: elementWithRect({ width: 0 }),
      header,
      scrollArea,
      viewportWidth: 1000,
      viewportHeight: 800,
      state: createPopoverState()
    });
    const renderedInTransformedPanel = elementWithRect({
      left: 40,
      top: 30,
      width: 300
    });

    const corrected = positionAnchoredPopover({
      anchor,
      popover: renderedInTransformedPanel,
      header,
      scrollArea,
      viewportWidth: 1000,
      viewportHeight: 800,
      currentStyle: initial.style,
      state: initial.state
    });

    expect(corrected.style).toBe("");
    expect(corrected.state.correctionPasses).toBe(1);
    expect(corrected.state.correctionX).not.toBe(0);
    expect(corrected.state.correctionY).not.toBe(0);
    expect(corrected.state.widthCorrection).toBe(20);
  });
});
