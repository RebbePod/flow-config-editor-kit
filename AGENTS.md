# AI contributor instructions

This repository is the **Flow Config Editor Kit for Salesforce**, an Apache-2.0-licensed Salesforce DX project for reusable Flow custom property editor components.

## Load the relevant skill

- For features, refactors, new resource families, data types, wrappers, or public APIs, read `.agents/skills/extend-flow-config-kit/SKILL.md` completely.
- For picker layout, icons, popovers, breadcrumbs, search, focus, keyboard, drag-and-drop, or visual consistency, read `.agents/skills/refine-flow-picker-ui/SKILL.md` completely.
- For testing, Salesforce validation, packaging, releases, or pre-PR checks, read `.agents/skills/validate-flow-config-kit/SKILL.md` completely.
- Load more than one when the task crosses those boundaries.

## Repository boundaries

- Keep reusable framework metadata in `force-app`.
- Keep the reference consumer in `examples`; core must never import the example.
- Preserve the `FlowConfig`/`flowConfig` metadata prefix and existing public component/event contracts.
- Never hard-code an org's objects, flows, Apex-defined classes, subflows, screen components, labels, or outputs.
- Treat Flow Builder inputs as versioned external data; tolerate absent properties and varying metadata shapes.
- Respect CRUD/FLS describe accessibility and never expose or log session IDs.

## Required quality bar

- Reuse shared models and utilities before adding component-local logic.
- Add or update Jest tests for JavaScript behavior and Apex tests for server behavior.
- Update `docs/COMPONENT_API.md`, `docs/ARCHITECTURE.md`, or `docs/LIMITATIONS.md` when their contracts change.
- Run `npm run verify` before handing off code changes.
- Keep `sourceApiVersion`, component/class/page metadata, manifests, the Tooling API bridge, documentation, Node baseline, and development dependencies current and synchronized.
- Run `npm run check:api-version` after any Salesforce API update and `npm run check:dependencies` during maintenance work; review peer and Node requirements before upgrading.
- Validate core separately from examples for packaging changes.
- Do not deploy, publish, commit, tag, or create a GitHub release unless the user explicitly asks.
