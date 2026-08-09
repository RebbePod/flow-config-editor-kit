---
name: extend-flow-config-kit
description: Extend or refactor the Flow Config Editor Kit for Salesforce while preserving its reusable architecture and public contracts. Use for new Flow resource families, supported data types, custom-editor wrappers, metadata discovery, generic SObject handling, public attributes or events, Apex services, shared utilities, and maintainability refactors in force-app or examples.
---

# Extend Flow Config Kit

Build framework behavior at the correct layer and keep the core independent from consumers.

## Establish context

1. Read `../../../docs/ARCHITECTURE.md` completely.
2. Read `../../../docs/COMPONENT_API.md` when changing component attributes, events, validation, or value formats.
3. Read `../../../docs/LIMITATIONS.md` when working around missing Flow Builder metadata.
4. Inspect the relevant source and tests before editing. Search imports to identify every consumer of a shared function.

## Choose the owning layer

- Put raw `builderContext` normalization and shared Flow event/icon helpers in `flowConfigEditorUtils`.
- Put resource grouping, search, compatibility, and lookup behavior in `flowConfigResourceModel`.
- Put cached SObject traversal in `flowConfigSchemaService`.
- Put Apex-defined and hierarchy-setting requests in `flowConfigMetadataService`.
- Put collection/generic SObject transition rules in `flowConfigGenericTypeCoordinator`.
- Put reusable literal-or-resource behavior in a thin wrapper around `flowConfigResourcePicker`.
- Keep consumer-specific requiredness, dependencies, and property names in the consuming editor under `examples` or downstream code.
- Do not duplicate picker header, positioning, interaction, or icon logic; use the UI skill for those changes.

## Preserve contracts

- Store Flow references in `{!Resource.Path}` syntax.
- Keep `resourcechange`, `valuechange`, and `fieldchange` detail shapes documented in `docs/COMPONENT_API.md`.
- Dispatch standard Flow configuration events through `flowConfigEditorUtils`.
- Persist ordered multiple field paths as a JSON String unless introducing an explicitly versioned alternative.
- Preserve saved-value restoration, removal, and literal/reference data-type markers.
- Treat missing arrays and fields in Flow inputs as normal, not exceptional.
- Keep metadata discovery dynamic; do not add known-org exceptions.

## Implement safely

1. Write or update the smallest pure helper first when logic can be separated from DOM state.
2. Add focused Jest tests for normalization and transitions, then component tests for integration behavior.
3. Add Apex tests for every server-side branch that is practical to construct without org-specific metadata.
4. Update the example only to demonstrate a public integration pattern; never make core depend on it.
5. Update public documentation in the same change.
6. Run `$validate-flow-config-kit` before handoff.

## Maintain platform currency

- Treat the Salesforce API version as one coordinated baseline. Update `sfdx-project.json`, every deployable `apiVersion`, both manifests, `FlowConfigApexTypeBridge.page`, and the README together.
- Run `npm run check:api-version` after changing that baseline; do not leave mixed metadata versions.
- During maintenance work, query the npm registry for current versions and run `npm run check:dependencies`.
- Upgrade dependency families together when peer requirements demand it. In particular, keep Salesforce's ESLint config, LWC/lightning plugins, ESLint major, Babel parser, Node engine, and CI Node version compatible.
- Regenerate `package-lock.json` with the supported Node/npm baseline and run the full suite after any dependency change.
- Prefer current stable releases, but do not force an incompatible major merely to eliminate an `outdated` result. Document the compatibility reason when holding a package back.

## Review checklist

- Confirm the behavior works for saved and newly entered values.
- Confirm scalar versus collection filtering and compatible type coercion.
- Confirm screen, action, subflow, Apex-defined, record, and global resources are not regressed.
- Confirm changing a generic record type clears only incompatible dependent values.
- Confirm no session, org, component, flow, class, or object identifiers are hard-coded.
