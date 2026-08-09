# Component API

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

When `property-name` is provided, selection and removal also dispatch the standard `configuration_editor_input_value_changed` or `configuration_editor_input_value_deleted` event expected by Flow Builder.

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

- `flowConfigEditorUtils`: Flow event creation, value parsing, resource collection, type normalization, labels, and icon selection.
- `flowConfigResourceModel`: resource filtering, grouping, search, and reference lookup.
- `flowConfigSchemaService`: cached SObject path descriptions.
- `flowConfigMetadataService`: cached Apex-defined and hierarchy-setting metadata.
- `flowConfigGenericTypeCoordinator`: pure state planning for collection/type changes.
- `flowConfigPopoverUtils`: viewport-aware popover placement and sizing.
- `flowConfigPickerInteraction`: click, focus, and drag interaction guards.
- `flowConfigPickerHeader`: shared breadcrumb navigation.

Treat functions imported by another bundle as public within the unnamespaced package. Add tests and preserve their signatures when extending them.
