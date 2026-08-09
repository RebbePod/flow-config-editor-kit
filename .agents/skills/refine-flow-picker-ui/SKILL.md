---
name: refine-flow-picker-ui
description: Improve and debug the Flow Config Editor Kit picker experience consistently across resource, value, single-field, and multi-field inputs. Use for popover placement or sizing, breadcrumbs, search within nested levels, saved pills, icons, labels, spacing, focus and click-out behavior, keyboard navigation, drag-and-drop ordering, accessibility, and Salesforce Flow Builder visual parity.
---

# Refine Flow Picker UI

Keep all picker experiences visually and behaviorally consistent inside Flow Builder's constrained property panel.

## Establish context

1. Read `../../../docs/ARCHITECTURE.md` and the relevant API section in `../../../docs/COMPONENT_API.md`.
2. Inspect both `flowConfigResourcePicker` and `flowConfigFieldPicker` before changing either. Similar behavior must share the same implementation path.
3. Inspect the shared helper named below before adding local CSS or JavaScript.

## Reuse the shared owner

- Breadcrumb rendering and navigation: `flowConfigPickerHeader`
- Viewport measurement, above/below placement, height, and width: `flowConfigPopoverUtils`
- Pointer, focus-out, click-out, edit-transition, and drag guards: `flowConfigPickerInteraction`
- Field/resource type normalization and icons: `flowConfigEditorUtils`
- Resource search/group compatibility: `flowConfigResourceModel`
- Nested SObject descriptions: `flowConfigSchemaService`

Change a shared owner when the behavior should match across pickers. Add component-local behavior only when the interaction is genuinely unique, such as multi-select ordering.

## Interaction rules

- Never let a popover cover its input when usable space exists above or below.
- Size from currently available viewport space; do not accumulate height across navigation.
- Preserve the editing text and saved value when opening, closing, or clicking outside.
- Clicking a saved pill must enter an editable state without immediately closing.
- Clearing must dispatch deletion and remain blank after Flow Builder rehydrates the editor.
- Search the current level while typing; replacing the entire query must return browsing to root when the reference root is gone.
- Breadcrumb ancestors must be clickable and the current level must not be presented as a link.
- Dragging and dropping inside multi-select must not trigger outside-click closure.
- Separate meaningful groups, not every result row. Match SLDS/Flow spacing and typography without copying inaccessible DOM.

## Accessibility rules

- Keep native buttons or correct interactive semantics.
- Maintain visible focus, keyboard activation, escaped close, and predictable tab order.
- Provide accessible names for icon-only controls.
- Announce validation and reset notices appropriately.
- Do not use color or icons as the only indication of state or type.

## Validate the change

1. Add Jest tests for the interaction state, not merely rendered text.
2. Exercise empty, prefilled, cleared, invalid, and saved/reopened states.
3. Exercise root and deeply nested levels near the top and bottom of the viewport.
4. Exercise single and multiple modes, including reorder arrows and drag-and-drop.
5. Compare the result/resource and selected-pill icons for the same data type.
6. Run `$validate-flow-config-kit` before handoff.
