# Getting started

## Prerequisites

- A Salesforce org with My Domain and Lightning Experience enabled
- Salesforce CLI (`sf`)
- Node.js 20 or later for local tests
- Permission to deploy Apex, Lightning Web Components, Visualforce, and permission sets

## Install the framework

Deploy only the core package directory:

```bash
sf project deploy start --source-dir force-app --target-org my-org --wait 30
sf org assign permset --name Flow_Config_Editor_Access --target-org my-org
```

The `examples` directory is intentionally excluded. Deploy it only to a development org when you want a working reference:

```bash
sf project deploy start --source-dir examples --target-org my-org --wait 30
```

## Connect an editor to a Flow screen component

Declare the custom property editor on the consuming component's Flow target configuration:

```xml
<targetConfig
  targets="lightning__FlowScreen"
  configurationEditor="c-my-component-editor"
>
  <property name="defaultValue" type="String" label="Default Value" />
</targetConfig>
```

Flow Builder supplies these public properties to the editor:

```js
import { LightningElement, api } from "lwc";

export default class MyComponentEditor extends LightningElement {
  @api builderContext;
  @api inputVariables = [];
  @api genericTypeMappings = [];
  @api automaticOutputVariables = {};
  @api elementInfo;
}
```

Use `getInputValue` or `getInputVariable` from `c/flowConfigEditorUtils` to read saved configuration. Use the supplied event creators to update Flow Builder:

```js
import {
  createInputValueChangedEvent,
  createInputValueDeletedEvent,
  getInputValue
} from "c/flowConfigEditorUtils";

set inputVariables(value) {
  this._inputVariables = value || [];
  this.defaultValue = getInputValue(this._inputVariables, "defaultValue", null);
}

handleValueChange(event) {
  this.defaultValue = event.detail.newValue;
  // The picker also emits the standard event when property-name is set.
}

clearDefault() {
  this.dispatchEvent(createInputValueDeletedEvent("defaultValue"));
}
```

## Choose the right picker

- Use `flowConfigValueInput` for a literal-or-resource scalar input.
- Use `flowConfigResourcePicker` when you need precise resource type or collection filtering.
- Use `flowConfigFieldPicker` after a record or collection selection provides an `objectApiName`.

## Generic record collections

For a collection that can accept any SObject, define a generic property type on the consuming Flow screen component. Keep the generic type mapping synchronized with the selected collection's `resource.objectType`. The example editor demonstrates separate mappings for single-field and multi-field collections and clears dependent field selections when an object type changes.

## Validation

Flow Builder calls the editor's `validate()` method. Return an array of objects shaped as `{ key, errorString }`. Reusable inputs expose `setCustomValidity()`, `validationMessage`, and `reportValidity()` so the editor can show the same error inline and in its summary.

## Next steps

- Review the complete [Component API](COMPONENT_API.md).
- Copy integration patterns from [`examples`](../examples/README.md).
- Read [Adapting the framework](ADAPTING.md) before adding resource categories or data types.
