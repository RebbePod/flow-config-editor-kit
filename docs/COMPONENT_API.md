---
layout: default
title: Component API
description: Public components, attributes, events, values, and validation contracts.
---

# Component API

## `c/flowConfigEditorBase`

Base class for custom property editors. Extending it supplies the entire Flow Builder contract — the four public inputs, the configuration events, and `validate()` — so an editor only writes its own rules.

```js
import FlowConfigEditorBase from "c/flowConfigEditorBase";

export default class MyEditor extends FlowConfigEditorBase {
  get label() {
    return this.input("label");
  }

  handleLabelChange(event) {
    this.setInput(
      "label",
      event.detail.newValue,
      event.detail.newValueDataType
    );
  }
}
```

Inherited public properties: `builderContext`, `inputVariables`, `genericTypeMappings`, `automaticOutputVariables`, `elementInfo`, and the `validate()` method. Do not redeclare them.

### Declarative properties

Set `static flowProperties` and the base renders the described controls, hydrates them, keeps generic type mappings and dependent fields in step, and reports required-value errors. An editor that declares a schema needs **no template and no event handlers**:

```js
import FlowConfigEditorBase from "c/flowConfigEditorBase";

export default class MyEditor extends FlowConfigEditorBase {
  static flowProperties = {
    records: {
      type: "SObject",
      collection: true,
      genericType: "T",
      objectProperty: "objectApiName",
      required: true
    },
    displayField: { type: "field", dependsOn: "records", required: true },
    heading: { type: "String" }
  };
}
```

| Key                  | Applies to | Meaning                                                               |
| -------------------- | ---------- | --------------------------------------------------------------------- |
| `type`               | all        | `String`, `Number`, `SObject`, or `field`. Defaults to `String`.      |
| `label`              | all        | Visible label. Defaults to a humanized property name.                 |
| `required`           | all        | Reports `"<label> is required."` when empty.                          |
| `helpText`           | all        | Help text beside the label.                                           |
| `placeholder`        | all        | Empty-state text.                                                     |
| `collection`         | `SObject`  | Restricts the picker to collections.                                  |
| `genericType`        | `SObject`  | Generic SObject type name kept in step with the selection.            |
| `objectProperty`     | `SObject`  | Optional Flow String property mirroring the resolved object API name. |
| `allowManual`        | `SObject`  | Allows a manually entered reference. Defaults to `true`.              |
| `dependsOn`          | `field`    | Property supplying the object API name.                               |
| `multiple`           | `field`    | Ordered multi-field selection.                                        |
| `sortable`           | `field`    | Shows ordering controls in multiple mode. Defaults to `true`.         |
| `allowCustom`        | `field`    | Enables the field/resource mode switch. Defaults to `false`.          |
| `customModeProperty` | `field`    | Optional Boolean Flow property that persists the selected mode.       |
| `acceptedTypes`      | `field`    | Comma-separated field types.                                          |

The schema is deliberately small. It covers scalars, record collections, and fields chosen from one of those collections. Anything it cannot express — reset notices, legacy property migration, conditional requiredness — drops to the imperative methods below, on the same class. Both layers compose: declare what fits and override `validateConfiguration()` or `configurationChanged()` for the rest.

Declaration order is render order.

### Reading saved configuration

| Method                                 | Returns                                                        |
| -------------------------------------- | -------------------------------------------------------------- |
| `input(name, fallback?, asReference?)` | Saved value for a Flow input property.                         |
| `reference(name, fallback?)`           | Saved value coerced to `{!Resource}` form.                     |
| `inputVariable(name)`                  | Raw input variable, including `valueDataType`.                 |
| `inputDataType(name, fallback?)`       | The saved `valueDataType` marker.                              |
| `genericType(typeName, fallback?)`     | Object API name bound to a generic SObject mapping.            |
| `apiVersion`                           | Flow runtime API version, resolved across Flow Builder shapes. |

### Writing configuration

| Method                                | Effect                                                                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `setInput(name, value, dataType?)`    | Assigns a Flow input property.                                                                                                                 |
| `clearInput(name, dataType?)`         | Removes an input assignment.                                                                                                                   |
| `setGenericType(typeName, typeValue)` | Assigns or clears a generic SObject mapping.                                                                                                   |
| `applyCollectionChange({ ... })`      | Moves a collection selection, its generic mapping, its mirrored object name, and its dependent field together. Returns the planned transition. |

### Validation

Override `validateConfiguration()` to return `[{ key, errorString }]`. Register errors outside that hook with `setError(key, message)`, `clearError(key)`, and `clearErrors()`. Read the last result through `validationErrors` and `hasValidationErrors`.

Inherited `validate()` merges declared errors, `validateConfiguration()` results, and the validity of every rendered input marked `data-validatable` with a `data-property` key, and mirrors each message back onto its input so the panel shows it inline.

### Lifecycle hook

Override `configurationChanged(source)` to derive local state when Flow Builder republishes an input. `source` is one of `builderContext`, `inputVariables`, `genericTypeMappings`, or `automaticOutputVariables`. Flow Builder publishes them in no guaranteed order, so each handler should tolerate the others being absent.

## `c-flow-config-value-input`

The recommended scalar input. It combines literal entry and Flow-resource selection in one control.

| Attribute                    | Type    | Default                              | Description                                                                          |
| ---------------------------- | ------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| `label`                      | String  | `Value`                              | Visible form label.                                                                  |
| `property-name`              | String  | —                                    | Flow input property to update.                                                       |
| `value`                      | Any     | —                                    | Current literal or `{!Reference}` value.                                             |
| `value-data-type`            | String  | —                                    | `String`, `Number`, or `reference` for the current value.                            |
| `value-type`                 | String  | `String`                             | Expected scalar type. `String` and `Number` are currently supported by this wrapper. |
| `builder-context`            | Object  | —                                    | Flow Builder context supplied to the custom editor.                                  |
| `automatic-output-variables` | Object  | `{}`                                 | Output metadata supplied by Flow Builder.                                            |
| `api-version`                | Number  | —                                    | Flow runtime API version used for versioned global resources.                        |
| `required`                   | Boolean | `false`                              | Enables required validation.                                                         |
| `placeholder`                | String  | `Enter value or search resources...` | Empty-state text.                                                                    |
| `field-level-help`           | String  | —                                    | Help text displayed beside the label.                                                |

Events: `valuechange`, with `{ name, newValue, newValueDataType, resource }`.

Public validation methods: `setCustomValidity(message)`, `reportValidity()`, and `validationMessage`.

Committed and restored Flow references are validated against the expected scalar type. This includes manually pasted references that bypass the visible result filter. Text inputs accept Flow's compatible primitive scalar resources (`String`, `Number`, `Boolean`, `Date`, `DateTime`, and `Time`), including Number resources that Salesforce automatically converts to Text. Number inputs remain restricted to Number resources. When metadata is available, an incompatible reference reports the resource label, its resolved type/cardinality, and the expected input shape. References with unresolved metadata remain allowed until Salesforce supplies their type.

Number literals must parse completely as finite numbers. Partially numeric text and nonnumeric values remain uncommitted and display guidance to enter a number or select a Number resource.

Reopening a committed literal does not request a state-neutral Flow configuration refresh, so the input and resource popover remain immediately editable. Empty inputs and committed resource references still request refreshed automatic outputs when opened.

Opening is progressive: the positioned popover shell renders first with a loading state, then root resource discovery and filtering begin after that initial paint. Automatic-output refresh and optional hierarchy-setting prefetch also begin after the shell is visible. Nested metadata loading continues inside the already-visible popover.

Resource searches include screen fields plus automatic action, Apex action, and subflow outputs. A container is shown only when its own label matches; when only a nested output matches, that output is shown directly with its parent path. Unmatched screen and automatic-output trees are skipped before they are built.

<figure class="doc-shot">
  <img src="{{ '/assets/images/screenshots/Text%20Input%202.png' | relative_url }}" width="1310" height="1332" loading="lazy" decoding="async" alt="Text value input showing grouped subflow outputs, global constants, and global variables in Flow Builder">
  <figcaption>A Text value input exposes only compatible Flow resources while preserving their native groups and nested navigation.</figcaption>
</figure>

## `c-flow-config-resource-picker`

The lower-level Flow resource browser.

| Attribute                    | Type    | Default              | Description                                                             |
| ---------------------------- | ------- | -------------------- | ----------------------------------------------------------------------- |
| `label`                      | String  | `Flow Resource`      | Visible form label.                                                     |
| `property-name`              | String  | —                    | Flow property updated by selection or removal.                          |
| `value`                      | Any     | —                    | Current value. References use Flow syntax such as `{!varAccount.Name}`. |
| `value-data-type`            | String  | —                    | Type marker for the current value.                                      |
| `builder-context`            | Object  | —                    | Flow Builder metadata.                                                  |
| `automatic-output-variables` | Object  | `{}`                 | Screen component output metadata.                                       |
| `api-version`                | Number  | —                    | Flow API version for versioned globals.                                 |
| `accepted-types`             | String  | empty                | Comma-separated compatible data types; empty accepts all.               |
| `collection`                 | String  | `any`                | `any`, `only`, or `exclude`.                                            |
| `allow-manual`               | Boolean | `false`              | Allows a manually entered Flow reference.                               |
| `allow-literal`              | Boolean | `false`              | Allows non-reference literal text.                                      |
| `allow-record-fields`        | Boolean | `false`              | Enables traversal from record resources into fields.                    |
| `literal-type`               | String  | `String`             | Data type assigned to literal values.                                   |
| `max-results`                | Number  | `100`                | Root scroll-batch size and nested-level result limit.                   |
| `required`                   | Boolean | `false`              | Enables required validation.                                            |
| `placeholder`                | String  | standard placeholder | Empty-state text.                                                       |
| `field-level-help`           | String  | —                    | Help text.                                                              |

Events: `resourcechange`, with `{ name, newValue, newValueDataType, resource }`.

When an empty picker or a picker holding a resource reference opens, it may emit the bubbling, composed `flowresourcerefresh` event with `{ name, currentValue, currentValueDataType }`. A custom editor can use this signal to re-report its current Flow configuration, which prompts Flow Builder to republish current automatic outputs. Committed literals skip this refresh so reopening remains immediate.

When `property-name` is provided, selection and removal also dispatch the standard `configuration_editor_input_value_changed` event expected by Flow Builder. Removal uses the same event with a `null` value, which is how Flow Builder's custom property editor contract clears an input assignment.

The popover shell paints before root resource derivation. Root results append another `max-results` batch when the results panel reaches the bottom; changing the query resets the visible batch.

`reportValidity()` applies the same `accepted-types` and `collection` compatibility rules to committed, restored, and manually pasted references that the browser applies while filtering results. Known incompatible references return `false` and display a contextual error. References whose metadata cannot yet be resolved are not rejected speculatively.

<figure class="doc-shot">
  <img src="{{ '/assets/images/screenshots/Text%20Input%201.png' | relative_url }}" width="1286" height="1420" loading="lazy" decoding="async" alt="Resource picker browsing through Opportunity, Campaign, Parent Campaign, and Owner relationship levels">
  <figcaption>Breadcrumbs keep every relationship level visible and directly navigable during a deep record-field search.</figcaption>
</figure>

## `c-flow-config-field-picker`

Searches fields for a known SObject and supports relationship traversal.

| Attribute                | Type    | Default                  | Description                                                                                                     |
| ------------------------ | ------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `label`                  | String  | `Field`                  | Visible form label.                                                                                             |
| `property-name`          | String  | —                        | Flow String property used to persist the selection.                                                             |
| `object-api-name`        | String  | —                        | Root SObject API name. Disable the picker until this is known.                                                  |
| `value`                  | String  | —                        | Field path, or a JSON array of paths in multiple mode.                                                          |
| `multiple`               | Boolean | `false`                  | Enables ordered multi-field selection.                                                                          |
| `sortable`               | Boolean | `true`                   | Shows drag, position, and arrow controls in multiple mode. Selected rows and removal remain visible when false. |
| `accepted-types`         | String  | empty                    | Comma-separated field types; empty accepts all.                                                                 |
| `max-results`            | Number  | `100`                    | Field results appended per scroll-loaded batch at one relationship level.                                       |
| `max-relationship-depth` | Number  | `5`                      | Maximum relationship traversal depth.                                                                           |
| `required`               | Boolean | `false`                  | Enables required validation.                                                                                    |
| `placeholder`            | String  | field-search placeholder | Empty-state text.                                                                                               |
| `field-level-help`       | String  | —                        | Help text.                                                                                                      |

Events: `fieldchange`, with `{ name, newValue, newValueDataType, field, selectedValues, selectedFields }`.

In multiple mode, `newValue` is a JSON string so it can be stored in a Flow String property. `selectedValues` preserves selection order for immediate editor use. Set `sortable=false` when order has no business meaning and the picker should behave as a simple multi-select dropdown.

The selected-fields panel is additive to the normal results-popover height when viewport space permits. On constrained screens, the combined popover is clamped to the available space and the selected panel and results retain their own scrolling regions.

In multiple mode, a compact icon-only X in the selected-fields heading clears the complete selection while leaving the picker open. Each selected row retains its own remove action. The picker closes through its header X, outside click, or Escape; it does not render a separate Done footer.

Saved single and multiple selections are revalidated against `accepted-types` after their field metadata loads. A known incompatible field returns `false` from `reportValidity()` and displays its label, API path, actual Flow type, and required type. Unresolved legacy field paths remain usable rather than being rejected without metadata.

The popover shell paints before field view-model derivation. Reaching the bottom appends another `max-results` field batch; changing the query or relationship level resets the batch.

<div class="doc-shot-grid">
  <figure class="doc-shot">
    <img src="{{ '/assets/images/screenshots/Single%20Field%20Selection.png' | relative_url }}" width="1316" height="1334" loading="lazy" decoding="async" alt="Single-field picker showing relationship fields and regular Account fields">
    <figcaption>Single-field selection groups relationships separately from selectable fields.</figcaption>
  </figure>
  <figure class="doc-shot">
    <img src="{{ '/assets/images/screenshots/Multi%20Field%20Selection.png' | relative_url }}" width="1306" height="1554" loading="lazy" decoding="async" alt="Multi-field picker showing three ordered selections and relationship fields">
    <figcaption>Multiple mode keeps selected fields visible above the browsable results.</figcaption>
  </figure>
</div>

## `c-flow-config-object-picker`

Searches accessible Salesforce objects and persists the selected object API name as a Flow String. It uses the same selected pill, searchable grouped popover, keyboard behavior, shared header, and viewport-aware placement as the resource and field pickers. Saved API names remain visible even if their metadata cannot currently be loaded.

| Attribute                | Type         | Default                   | Description                                                      |
| ------------------------ | ------------ | ------------------------- | ---------------------------------------------------------------- |
| `label`                  | String       | `Object`                  | Visible form label.                                              |
| `property-name`          | String       | —                         | Flow String property used to persist the object API name.        |
| `value`                  | String       | —                         | Current object API name, such as `Account` or `Invoice__c`.      |
| `available-object-types` | String/Array | empty                     | Optional API-name allowlist; empty or `All` accepts all objects. |
| `queryable-only`         | Boolean      | `false`                   | Excludes objects that cannot be queried.                         |
| `show-all`               | Boolean      | `false`                   | Initially includes specialized accessible objects when true.     |
| `max-results`            | Number       | `200`                     | Number of matching objects rendered per scroll-loaded batch.     |
| `required`               | Boolean      | `false`                   | Enables required validation.                                     |
| `placeholder`            | String       | object-search placeholder | Empty-state text.                                                |
| `field-level-help`       | String       | —                         | Help text.                                                       |

Event `objectchange` returns `{ name, newValue, newValueDataType, object, objectType }`. `object` is the selected descriptor and `objectType` mirrors `newValue` for consumers that coordinate generic SObject mappings. Selection and removal also dispatch the standard Flow input-value event when `property-name` is set. The root-level `Show all objects` switch updates the local filter and emits `filterchange` with `{ showAll }`.

By default, the picker shows user-facing standard objects plus custom and external objects. Feed, history, share, platform-event, custom-setting, and other internal read-only metadata remains available through `Show all objects`. Discovery is cacheable and respects object accessibility. Descriptors include API name, singular/plural labels, custom/queryable/searchable/custom-setting flags, and create/update/delete capabilities so consumers can filter without another metadata request. Unusable Salesforce missing-label markers fall back to the API name.

The object popover shell paints before its prepared object index is filtered. Reaching the bottom of the results panel appends the next `max-results` matches, while changing the search or object filter restarts from the first batch.

<figure class="doc-shot">
  <img src="{{ '/assets/images/screenshots/Object%20Name%20Picker.png' | relative_url }}" width="1282" height="1290" loading="lazy" decoding="async" alt="Object picker displaying standard Salesforce objects and the Show all objects toggle">
  <figcaption>The default view prioritizes normal objects; the header switch reveals every accessible object type.</figcaption>
</figure>

## `c-flow-config-field-input`

Composes `flowConfigFieldPicker` and `flowConfigValueInput` for properties that normally select an SObject field but may deliberately use a custom literal or Flow resource. It accepts the field picker's attributes plus `value-data-type`, `builder-context`, `automatic-output-variables`, `api-version`, `allow-custom`, and controlled `custom-mode`.

When enabled, an accessible `Custom value` switch is rendered in the shared picker header beside the breadcrumbs at the root level. It is hidden while browsing nested relationships or resources and returns after navigating back to the root. Switching replaces the field browser with the standard Flow resource/literal picker and opens it immediately. `custom-mode` is controlled so a consuming editor can persist the user's choice in its own optional Boolean Flow property. Switching modes does not clear or rewrite the current value. Event `modechange` returns `{ customMode }`; event `valuechange` returns the active child's standard value detail plus `customMode`.

Public validation methods: `setCustomValidity(message)`, `reportValidity()`, and `validationMessage`.

### Advanced wrapper composition

`flowConfigResourcePicker`, `flowConfigValueInput`, and `flowConfigFieldPicker` also expose `mode-toggle-label` and controlled `mode-toggle-checked` attributes for framework wrappers such as `flowConfigFieldInput`. The root picker header emits `modetoggle`; nested relationship/resource levels hide the switch. These attributes are useful when building another reusable compound input, but ordinary custom property editors should prefer `flowConfigFieldInput` so mode state and events remain coordinated.

## Shared utility modules

- `flowConfigEditorBase`: the editor base class documented above.
- `flowConfigEditorUtils`: Flow event creation, value parsing, resource collection, type normalization, labels, and icon selection.
- `flowConfigResourceModel`: resource filtering, grouping, search, and reference lookup.
- `flowConfigObjectModel`: object-label normalization and default/all-object filtering.
- `flowConfigSchemaService`: cached SObject path descriptions.
- `flowConfigMetadataService`: cached Apex-defined and hierarchy-setting metadata.
- `flowConfigGenericTypeCoordinator`: pure state planning for collection/type changes.
- `flowConfigPopoverUtils`: viewport-aware popover placement and sizing.
- `flowConfigPickerInteraction`: click, focus, and drag interaction guards.
- `flowConfigPickerHeader`: shared breadcrumb navigation.

Treat functions imported by another bundle as public within the unnamespaced package. Add tests and preserve their signatures when extending them.
