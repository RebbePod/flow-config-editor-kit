const DEFAULT_OPTIONS = Object.freeze({
  viewportMargin: 8,
  anchorGap: 4,
  minimumHeight: 220,
  maximumHeight: 440,
  compactMaximumHeight: 380,
  compactHeaderHeight: 36,
  correctionLimit: 3
});

export function createPopoverState() {
  return {
    anchorSignature: "",
    correctionX: 0,
    correctionY: 0,
    widthCorrection: 0,
    correctionPasses: 0,
    openAbove: false
  };
}

export function buildPickerBreadcrumbs(rootLabel, browseStack = []) {
  const nodes = Array.isArray(browseStack) ? browseStack : [];
  const items = [
    { key: "breadcrumb-root", label: rootLabel, depth: 0 },
    ...nodes.map((node, index) => ({
      key: `breadcrumb-${index}-${node.path || node.namespace || node.label}`,
      label: node.label,
      depth: index + 1
    }))
  ];
  return items.map((item, index) => ({
    ...item,
    showSeparator: index > 0,
    isCurrent: index === items.length - 1
  }));
}

export function addPopoverViewportListeners(handler) {
  window.addEventListener("resize", handler);
  window.addEventListener("scroll", handler, true);
}

export function removePopoverViewportListeners(handler) {
  window.removeEventListener("resize", handler);
  window.removeEventListener("scroll", handler, true);
}

/**
 * Keeps viewport work scoped to an open picker and coalesces scroll/resize
 * bursts into one measurement per animation frame.
 */
export function createPopoverViewportController(handler) {
  let active = false;
  let frame = null;
  let arming = false;
  const run = () => {
    frame = null;
    if (!active) {
      return;
    }
    handler();
    // Keep following the anchor for as long as the picker is open.
    //
    // A `scroll` listener on `window` cannot see every scroll that moves an anchor.
    // `scroll` is not composed, so it never crosses a shadow boundary: not from a
    // consuming component's own scrolling panel, and not from Flow Builder's
    // property panel, whose scroller sits inside Flow Builder's shadow root.
    // Measuring once per frame covers both, plus anything else that moves the
    // anchor, without walking ancestors across shadow boundaries.
    //
    // The cost is one measurement per frame while open, which is the budget this
    // controller already spends during a scroll: `positionAnchoredPopover` returns
    // the same style string when nothing moved, so an idle popover writes no DOM.
    //
    // Re-armed here rather than through `schedule` so the follow loop is confined
    // to the animation-frame path. `schedule`'s promise fallback exists for
    // environments without `requestAnimationFrame`, and re-entering it would spin
    // microtasks.
    //
    // `arming` guards re-entrancy. A synchronous `requestAnimationFrame` -- a shim,
    // or a test double -- invokes this callback before the request returns, which
    // without the guard is unbounded recursion rather than a loop.
    if (arming || typeof window.requestAnimationFrame !== "function") {
      return;
    }
    arming = true;
    frame = true;
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    const requestId = window.requestAnimationFrame(run);
    if (frame === true) {
      frame = requestId;
    }
    arming = false;
  };
  const schedule = () => {
    if (!active || frame !== null) {
      return;
    }
    if (typeof window.requestAnimationFrame === "function") {
      frame = true;
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      const requestId = window.requestAnimationFrame(run);
      if (frame === true) {
        frame = requestId;
      }
    } else {
      frame = true;
      Promise.resolve().then(run);
    }
  };
  const setActive = (nextActive) => {
    const shouldBeActive = Boolean(nextActive);
    if (shouldBeActive === active) {
      return;
    }
    active = shouldBeActive;
    if (active) {
      addPopoverViewportListeners(schedule);
      schedule();
      return;
    }
    removePopoverViewportListeners(schedule);
    if (
      frame !== null &&
      frame !== true &&
      typeof window.cancelAnimationFrame === "function"
    ) {
      window.cancelAnimationFrame(frame);
    }
    frame = null;
  };
  return {
    setActive,
    schedule,
    disconnect: () => setActive(false)
  };
}

/** Defers expensive result derivation until the picker shell has painted. */
export function createProgressiveRenderController(onReady) {
  let frame = null;
  const cancel = () => {
    if (frame !== null && typeof window.cancelAnimationFrame === "function") {
      window.cancelAnimationFrame(frame);
    }
    frame = null;
  };
  const schedule = () => {
    cancel();
    const finish = () => {
      frame = null;
      onReady();
    };
    if (typeof window.requestAnimationFrame !== "function") {
      Promise.resolve().then(finish);
      return;
    }
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    frame = window.requestAnimationFrame(() => {
      // eslint-disable-next-line @lwc/lwc/no-async-operation
      frame = window.requestAnimationFrame(finish);
    });
  };
  return { schedule, cancel };
}

export function setPopoverHostActive(host, active) {
  if (!host) {
    return;
  }
  host.style.position = active ? "relative" : "";
  host.style.zIndex = active ? "1000000" : "";
}

function measuredHeight(element) {
  return Math.max(
    element?.scrollHeight || 0,
    element?.getBoundingClientRect?.().height || 0
  );
}

/**
 * Returns the smallest height a picker's search input has had.
 *
 * A `lightning-input` host also contains its validation message, and the message
 * lives in the input's shadow root, where a picker cannot measure it. The host only
 * grows when that message appears, so its smallest height is the input box alone.
 * In Flow Builder the popover opens on focus, before a required message can show,
 * so the first measurement is already the box.
 */
export function rememberInputBoxHeight(rememberedHeight, input) {
  const height = input?.getBoundingClientRect().height;
  return height && !(rememberedHeight <= height) ? height : rememberedHeight;
}

/**
 * Anchors to the input box rather than the whole host, so the popover covers
 * "Complete this field." instead of dropping below it, which is where
 * `lightning-base-combobox` attaches its own dropdown.
 */
function fieldBoxRect(anchor, boxHeight) {
  const rect = anchor.getBoundingClientRect();
  if (!boxHeight || boxHeight >= rect.height) {
    return rect;
  }
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    bottom: rect.top + boxHeight
  };
}

function resetCorrections(state, anchorSignature, openAbove) {
  return {
    ...createPopoverState(),
    anchorSignature,
    openAbove
  };
}

/**
 * Positions a picker outside Flow Builder's clipped property panel.
 *
 * Flow Builder uses transformed ancestors, which can change how a browser
 * interprets `position: fixed`. The first pass calculates viewport geometry;
 * later passes compare the rendered rectangle and compensate for that
 * containing-block offset. Both resource and field pickers use this exact
 * routine so their placement and breadcrumb-height behavior cannot drift.
 */
export function positionAnchoredPopover({
  anchor,
  anchorBoxHeight,
  popover,
  header,
  scrollArea,
  actions,
  currentStyle = "",
  state = createPopoverState(),
  viewportWidth = window.innerWidth,
  viewportHeight = window.innerHeight,
  options = {}
}) {
  if (!anchor || !popover) {
    return { style: currentStyle, state };
  }
  const anchorRect = fieldBoxRect(anchor, anchorBoxHeight);
  if (!anchorRect.width) {
    return { style: currentStyle, state };
  }

  const settings = { ...DEFAULT_OPTIONS, ...options };
  const headerHeight = Math.ceil(measuredHeight(header));
  const actionsHeight = Math.ceil(measuredHeight(actions));
  const naturalHeight = Math.ceil(
    headerHeight + (scrollArea?.scrollHeight || 0) + actionsHeight + 2
  );
  const dynamicMaximum = Math.min(
    settings.maximumHeight,
    settings.compactMaximumHeight +
      Math.max(0, headerHeight - settings.compactHeaderHeight)
  );
  // Optional panels such as multi-select's selected-field summary sit above
  // the normal results scroller. Add their rendered height to the popover's
  // budget so they do not consume the browsing area when viewport space is
  // available. The final viewport clamp below still handles constrained screens.
  const expandedMaximum = dynamicMaximum + actionsHeight;
  const desiredHeight = Math.min(
    expandedMaximum,
    Math.max(
      settings.minimumHeight + actionsHeight,
      naturalHeight || expandedMaximum
    )
  );
  const spaceBelow =
    viewportHeight - anchorRect.bottom - settings.viewportMargin;
  const spaceAbove = anchorRect.top - settings.viewportMargin;
  const width = Math.min(
    anchorRect.width,
    viewportWidth - settings.viewportMargin * 2
  );
  const desiredLeft = Math.min(
    Math.max(settings.viewportMargin, anchorRect.left),
    Math.max(
      settings.viewportMargin,
      viewportWidth - width - settings.viewportMargin
    )
  );
  const anchorSignature = [
    Math.round(anchorRect.left),
    Math.round(anchorRect.top),
    Math.round(anchorRect.width)
  ].join(":");
  let nextState = state;
  if (anchorSignature !== state.anchorSignature) {
    nextState = resetCorrections(
      state,
      anchorSignature,
      spaceAbove > spaceBelow
    );
  }

  const availableHeight = Math.max(
    100,
    nextState.openAbove ? spaceAbove : spaceBelow
  );
  const height = Math.min(desiredHeight, availableHeight);
  const desiredTop = nextState.openAbove
    ? Math.max(
        settings.viewportMargin,
        anchorRect.top - height - settings.anchorGap
      )
    : Math.min(
        viewportHeight - height - settings.viewportMargin,
        anchorRect.bottom + settings.anchorGap
      );
  const left = desiredLeft + nextState.correctionX;
  const top = desiredTop + nextState.correctionY;
  const correctedWidth = width + nextState.widthCorrection;
  const style =
    `position:fixed;left:${left}px;right:auto;width:${correctedWidth}px;` +
    `height:${height}px;top:${top}px;bottom:auto;` +
    `--picker-max-height:${height}px;`;

  if (style !== currentStyle) {
    return { style, state: nextState };
  }

  const popoverRect = popover.getBoundingClientRect();
  if (!popoverRect?.width) {
    return { style, state: nextState };
  }
  const horizontalError = desiredLeft - popoverRect.left;
  const verticalError = desiredTop - popoverRect.top;
  const widthError = width - popoverRect.width;
  const needsCorrection =
    Math.abs(horizontalError) > 1 ||
    Math.abs(verticalError) > 1 ||
    Math.abs(widthError) > 1;
  if (
    !needsCorrection ||
    nextState.correctionPasses >= settings.correctionLimit
  ) {
    return { style, state: nextState };
  }

  return {
    // Clearing the style forces a render before the corrected pass. This is
    // required in Flow Builder because its transformed panel is asynchronous.
    style: "",
    state: {
      ...nextState,
      correctionX: nextState.correctionX + horizontalError,
      correctionY: nextState.correctionY + verticalError,
      widthCorrection: nextState.widthCorrection + widthError,
      correctionPasses: nextState.correctionPasses + 1
    }
  };
}
