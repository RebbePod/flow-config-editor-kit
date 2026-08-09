# Changelog

All notable changes will be documented here. This project follows semantic versioning once public releases begin.

## 0.1.0 - Unreleased

### Added

- Reusable Flow resource, value, and SObject field pickers.
- Nested relationship traversal and ordered multi-field selection.
- Support for standard Flow resources, globals, element outputs, Apex-defined values, Custom Labels, and Custom Hierarchy Settings.
- Shared resource normalization, schema, metadata, interaction, breadcrumb, icon, generic-type, and popover behavior.
- Apex and Visualforce metadata services for schema and Apex-defined type discovery.
- Optional example package and automated LWC/Apex tests.
- Repository-local AI contributor skills and validation guidance.
- `flowConfigEditorBase`, a base class that supplies the whole Flow Builder custom property editor contract — public inputs, configuration events, generic type-mapping transitions, and `validate()` — so consuming editors carry only their own rules.

### Changed

- The example editor now extends `flowConfigEditorBase`, dropping a third of its code with no behavior change.
- Updated the Salesforce metadata and Tooling API baseline to API 67.0.

### Fixed

- The Visualforce metadata bridge validates its parent origin before installing a message listener and re-checks the origin of every inbound message.
- Apex-defined type inspection requires Manage Flow, so the framework permission set no longer implies access to Apex source.
- Hierarchy-setting discovery no longer describes every SObject in the org.
- Updated the development toolchain to the current Salesforce ESLint, LWC Jest, Prettier, and compatible ESLint 9 releases.
