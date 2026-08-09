# Architecture

## Data flow

```text
Flow Builder
  │ builderContext / inputVariables / mappings / outputs
  ▼
Consuming custom property editor (examples/...Editor)
  ├─ flowConfigValueInput
  │    └─ flowConfigResourcePicker
  └─ flowConfigFieldPicker
       │
       ├─ shared model, event, interaction, icon, header, and popover modules
       └─ cached metadata services
            └─ FlowConfigApexTypeController / FlowConfigApexTypeBridge
```

The consuming editor owns business rules: which inputs are required, which collection controls which field picker, and which Flow properties are updated. The framework owns discovery, filtering, navigation, rendering, and standard event construction.

## Layers

### Presentation

`flowConfigResourcePicker`, `flowConfigFieldPicker`, and `flowConfigPickerHeader` render the UI and manage local navigation. `flowConfigValueInput` provides a deliberately small wrapper for the common literal-or-resource pattern.

### Domain/model

`flowConfigResourceModel` and `flowConfigEditorUtils` normalize Salesforce's varying metadata shapes into a stable resource model. Filtering operates on normalized type, collection, source, label, API name, and reference values.

### Coordination

`flowConfigGenericTypeCoordinator` contains pure transition logic for generic SObject mappings. `flowConfigPickerInteraction` centralizes transient pointer/focus behavior. `flowConfigPopoverUtils` measures viewport space and provides a single placement model for all pickers.

### Metadata

`flowConfigSchemaService` and `flowConfigMetadataService` cache server descriptions. The Apex controller uses Schema describe for SObjects and accessible hierarchy settings and parses Apex source as a fallback. The Visualforce bridge uses the Tooling API symbol table when Flow does not expose Apex-defined members.

## State ownership

- Flow Builder owns persisted input variables and generic type mappings.
- The custom editor mirrors those values and dispatches configuration events.
- Pickers own only editing state: query, breadcrumbs, active result, and popover state.
- Metadata services own request caches, not selected values.

This boundary prevents a picker from silently inventing business rules or retaining stale selections after Flow Builder rehydrates the editor.

## Extension points

To add a resource family, normalize it in `flowConfigEditorUtils`, group/filter it in `flowConfigResourceModel`, and reuse the existing picker rendering contract. To add a data type, update normalization and shared icon mapping first so all pickers remain consistent.

To add a specialized input, compose `flowConfigResourcePicker` rather than copying it. Put consuming behavior in a new wrapper and keep Flow configuration events standardized through `flowConfigEditorUtils`.

## Packaging

The project intentionally uses an unnamespaced source package because LWCs in consuming org code refer to components in the `c` namespace. All metadata uses a `FlowConfig`/`flowConfig` prefix to reduce collision risk. The optional example is a second package directory and is never required by core components.
