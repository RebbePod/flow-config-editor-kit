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

| Key              | Applies to | Meaning                                                               |
| ---------------- | ---------- | --------------------------------------------------------------------- |
| `type`           | all        | `String`, `Number`, `SObject`, or `field`. Defaults to `String`.      |
| `label`          | all        | Visible label. Defaults to a humanized property name.                 |
| `required`       | all        | Reports `"<label> is required."` when empty.                          |
| `helpText`       | all        | Help text beside the label.                                           |
| `placeholder`    | all        | Empty-state text.                                                     |
| `collection`     | `SObject`  | Restricts the picker to collections.                                  |
| `genericType`    | `SObject`  | Generic SObject type name kept in step with the selection.            |
| `objectProperty` | `SObject`  | Optional Flow String property mirroring the resolved object API name. |
| `allowManual`    | `SObject`  | Allows a manually entered reference. Defaults to `true`.              |
| `dependsOn`      | `field`    | Property supplying the object API name.                               |
| `multiple`       | `field`    | Ordered multi-field selection.                                        |
| `acceptedTypes`  | `field`    | Comma-separated field types.                                          |

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
| `max-results`                | Number  | `100`                | Maximum search results.                                                 |
| `required`                   | Boolean | `false`              | Enables required validation.                                            |
| `placeholder`                | String  | standard placeholder | Empty-state text.                                                       |
| `field-level-help`           | String  | —                    | Help text.                                                              |

Events: `resourcechange`, with `{ name, newValue, newValueDataType, resource }`.

When `property-name` is provided, selection and removal also dispatch the standard `configuration_editor_input_value_changed` event expected by Flow Builder. Removal uses the same event with a `null` value, which is how Flow Builder's custom property editor contract clears an input assignment.

## `c-flow-config-field-picker`

Searches fields for a known SObject and supports relationship traversal.

| Attribute                | Type    | Default                  | Description                                                    |
| ------------------------ | ------- | ------------------------ | -------------------------------------------------------------- |
| `label`                  | String  | `Field`                  | Visible form label.                                            |
| `property-name`          | String  | —                        | Flow String property used to persist the selection.            |
| `object-api-name`        | String  | —                        | Root SObject API name. Disable the picker until this is known. |
| `value`                  | String  | —                        | Field path, or a JSON array of paths in multiple mode.         |
| `multiple`               | Boolean | `false`                  | Enables ordered multi-field selection.                         |
| `accepted-types`         | String  | empty                    | Comma-separated field types; empty accepts all.                |
| `max-results`            | Number  | `100`                    | Maximum results at one level.                                  |
| `max-relationship-depth` | Number  | `5`                      | Maximum relationship traversal depth.                          |
| `required`               | Boolean | `false`                  | Enables required validation.                                   |
| `placeholder`            | String  | field-search placeholder | Empty-state text.                                              |
| `field-level-help`       | String  | —                        | Help text.                                                     |

Events: `fieldchange`, with `{ name, newValue, newValueDataType, field, selectedValues, selectedFields }`.

In multiple mode, `newValue` is a JSON string so it can be stored in a Flow String property. `selectedValues` is an ordered array for immediate editor use.

## Shared utility modules

- `flowConfigEditorBase`: the editor base class documented above.
- `flowConfigEditorUtils`: Flow event creation, value parsing, resource collection, type normalization, labels, and icon selection.
- `flowConfigResourceModel`: resource filtering, grouping, search, and reference lookup.
- `flowConfigSchemaService`: cached SObject path descriptions.
- `flowConfigMetadataService`: cached Apex-defined and hierarchy-setting metadata.
- `flowConfigGenericTypeCoordinator`: pure state planning for collection/type changes.
- `flowConfigPopoverUtils`: viewport-aware popover placement and sizing.
- `flowConfigPickerInteraction`: click, focus, and drag interaction guards.
- `flowConfigPickerHeader`: shared breadcrumb navigation.

Treat functions imported by another bundle as public within the unnamespaced package. Add tests and preserve their signatures when extending them.
