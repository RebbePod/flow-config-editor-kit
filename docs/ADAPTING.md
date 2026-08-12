---
layout: default
title: Adapting the framework
description: Extend the kit while preserving its reusable contracts and architecture.
---

# Adapting the framework

## Build a specialized resource input

Prefer a thin wrapper around `c-flow-config-resource-picker`. Set compatibility attributes in markup and re-emit a domain-specific event, as `flowConfigValueInput` does. This keeps navigation, display, validation, and Flow event behavior consistent.

## Add a resource category

1. Inspect the actual `builderContext` shape across supported Flow/API versions.
2. Normalize raw entries into the shared resource shape in `flowConfigEditorUtils`.
3. Give each entry a stable `name`, `reference`, `label`, `source`, `category`, `dataType`, `isCollection`, and any `objectType`/`apexClass` metadata.
4. Update grouping/filtering in `flowConfigResourceModel` only if the existing generic behavior is insufficient.
5. Add model tests and picker interaction tests.

Do not add an org-specific resource name. Discovery must be driven by Flow Builder or Salesforce metadata.

## Add or change an icon

All resource and field icons should resolve through the shared icon helpers in `flowConfigEditorUtils`. Keep Salesforce field types normalized before selecting an icon. Avoid component-local icon tables; they drift and produce inconsistent saved/restored pills.

## Add an input data type

1. Add normalization aliases.
2. Define resource compatibility and literal parsing.
3. Update the shared icon mapping.
4. Test direct resources, record fields, element outputs, saved-value restoration, and incompatible filtering.
5. Add a wrapper only if the type needs custom literal behavior.

## Add another collection-dependent picker

Let the editor own the selected collection and resolved object API name. Pass only the object name and selected value into `flowConfigFieldPicker`. When the collection's object type changes, clear incompatible dependent fields and dispatch both the generic-type mapping event and input deletion event.

## Preserve Flow Builder compatibility

- Treat `builderContext` as versioned external input and tolerate missing arrays/properties.
- Clone incoming arrays before local processing.
- Keep references in `{!...}` syntax.
- Persist multiple field paths as a JSON String when the consuming Flow property is a String.
- Avoid relying on unsaved sibling screen outputs; Salesforce does not always republish them to custom editors immediately.
- Validate in the editor's public `validate()` method and surface the same error inline.
