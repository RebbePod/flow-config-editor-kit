# Changelog

All notable changes will be documented here. This project follows semantic versioning once public releases begin.

## 0.1.0 - Unreleased

### Added

- Reusable Flow resource, value, and SObject field pickers.
- A direct Salesforce object picker with a focused default object list, an optional all-object view, accessible metadata discovery, and progressive loading.
- A field-or-custom-value input that lets consumers optionally switch between SObject fields and compatible literals or Flow resources.
- Nested relationship traversal and ordered multi-field selection.
- Support for standard Flow resources, globals, element outputs, Apex-defined values, Custom Labels, and Custom Hierarchy Settings.
- Shared resource normalization, schema, metadata, interaction, breadcrumb, icon, generic-type, and popover behavior.
- Apex and Visualforce metadata services for schema and Apex-defined type discovery.
- Optional example package and automated LWC/Apex tests.
- Repository-local AI contributor skills and validation guidance.
- `docs/llms.txt`, a single self-contained reference for coding agents building an editor with the framework, and a consumer-facing `build-flow-config-editor` skill that can be copied into a downstream project.
- `flowConfigEditorBase`, a base class that supplies the whole Flow Builder custom property editor contract — public inputs, configuration events, generic type-mapping transitions, and `validate()` — so consuming editors carry only their own rules.
- A declarative `static flowProperties` schema on that base class, rendered by `flowConfigEditorForm` and normalized by `flowConfigEditorSchema`, reducing a straightforward editor to one file with no template or event handlers.
- Contextual saved-value validation for resource, value, and field inputs, including Flow-compatible primitive conversion for Text and strict Number validation.
- A documentation link check and a GitHub Pages documentation site built from the repository's existing Markdown.

### Changed

- The framework is now built as a no-namespace unlocked package, with a tagged release workflow that verifies a version installs into a scratch org before promoting it.

- The example editor now extends `flowConfigEditorBase`, dropping a third of its code with no behavior change.
- Updated the Salesforce metadata and Tooling API baseline to API 67.0.
- Resource, field, and object picker popovers now paint before expensive result preparation and progressively append large result sets while scrolling.
- Multi-field selection keeps selected rows visible when sorting is disabled, provides an icon-only clear-all action, and closes without a redundant Done button.
- Routine Dependabot updates are grouped monthly; security updates continue to be surfaced promptly, and major toolchain upgrades remain intentional maintenance work.

### Fixed

- The Visualforce metadata bridge validates its parent origin before installing a message listener and re-checks the origin of every inbound message.
- Apex-defined type inspection requires Manage Flow, so the framework permission set no longer implies access to Apex source.
- Hierarchy-setting discovery no longer describes every SObject in the org.
- Updated the development toolchain to the current Salesforce ESLint, LWC Jest, Prettier, and compatible ESLint 9 releases.
- Resource searches no longer retain unmatched automatic-output or subflow containers, and reopening a committed literal no longer triggers a state-neutral refresh that delays editing.
