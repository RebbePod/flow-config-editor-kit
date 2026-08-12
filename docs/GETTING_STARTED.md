---
layout: default
title: Getting started
description: Install the Flow Config Editor Kit and build a custom property editor.
---

# Getting started

## Prerequisites

- A Salesforce org with My Domain and Lightning Experience enabled
- Salesforce CLI (`sf`)
- Node.js 22 or later for local tests
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

For most editors, extend `c/flowConfigEditorBase` and declare `static flowProperties`. The base class renders the inputs, reads and writes Flow Builder configuration, coordinates dependent fields and generic SObject types, and implements validation.

```js
import FlowConfigEditorBase from "c/flowConfigEditorBase";

export default class MyComponentEditor extends FlowConfigEditorBase {
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

Use the imperative API only when the schema cannot express an editor-specific behavior such as legacy-value migration, reset notices, or conditional validation. The base declares the four public properties Flow Builder supplies (`builderContext`, `inputVariables`, `genericTypeMappings`, `automaticOutputVariables`), plus `elementInfo` and `validate()`, so your editor only writes its own rules.

```js
import FlowConfigEditorBase from "c/flowConfigEditorBase";

export default class MyComponentEditor extends FlowConfigEditorBase {
  get defaultValue() {
    return this.input("defaultValue");
  }

  get defaultValueDataType() {
    return this.inputDataType("defaultValue", "String");
  }

  handleValueChange(event) {
    // The picker already emitted the standard event because property-name is
    // set. Handle this only when the editor needs to react to the change.
    this.clearErrors();
  }

  clearDefault() {
    this.clearInput("defaultValue");
  }

  validateConfiguration() {
    return this.defaultValue
      ? []
      : [{ key: "defaultValue", errorString: "Default Value is required." }];
  }
}
```

Mark each rendered input with `data-validatable` and `data-property` so the inherited `validate()` can mirror errors onto it:

```html
<c-flow-config-value-input
  data-validatable
  data-property="defaultValue"
  label="Default Value"
  property-name="defaultValue"
  value="{defaultValue}"
  value-data-type="{defaultValueDataType}"
  builder-context="{builderContext}"
  automatic-output-variables="{automaticOutputVariables}"
  api-version="{apiVersion}"
  onvaluechange="{handleValueChange}"
></c-flow-config-value-input>
```

Do not redeclare the inherited `@api` properties. If you need to derive local state when Flow Builder republishes one, override `configurationChanged(source)` instead.

If you would rather not extend the base class, `c/flowConfigEditorUtils` still exports `getInputValue`, `getInputVariable`, and the event creators directly.

## Choose the right picker

- Use `flowConfigValueInput` for a literal-or-resource scalar input.
- Use `flowConfigResourcePicker` when you need precise resource type or collection filtering.
- Use `flowConfigFieldPicker` after a record or collection selection provides an `objectApiName`.
- Use `flowConfigFieldInput` when a field property may optionally accept a custom literal or Flow resource.
- Use `flowConfigObjectPicker` when the Flow property itself stores an object API name rather than deriving it from a selected record resource.

## Generic record collections

For a collection that can accept any SObject, define a generic property type on the consuming Flow screen component. Keep the generic type mapping synchronized with the selected collection's `resource.objectType`. The example editor demonstrates separate mappings for single-field and multi-field collections and clears dependent field selections when an object type changes.

## Validation

Flow Builder calls the editor's `validate()` method and expects an array of `{ key, errorString }`.

`c/flowConfigEditorBase` implements `validate()` for you. Put business rules in `validateConfiguration()`, and mark inputs with `data-validatable` / `data-property`; the base merges your rules with each picker's own validity and mirrors every message onto its input so the same error appears inline and in the summary.

Editors that do not extend the base can drive this themselves — every reusable input exposes `setCustomValidity()`, `validationMessage`, and `reportValidity()`.

## Next steps

- Review the complete [Component API](COMPONENT_API.md).
- Copy integration patterns from the [`examples`](https://github.com/RebbePod/flow-config-editor-kit/tree/main/examples).
- Read [Adapting the framework](ADAPTING.md) before adding resource categories or data types.
