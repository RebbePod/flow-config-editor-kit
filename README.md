# Flow Config Editor Kit for Salesforce

A reusable set of Lightning Web Components for building richer custom property editors in Salesforce Flow Builder.

The framework provides a Flow-resource picker, an SObject field picker with relationship traversal, shared picker UI, Flow Builder event helpers, schema/metadata services, validation support, and generic SObject type coordination. It is intended for developers building `configurationEditor` LWCs for Flow screen components.

> This is an independent open-source project. It is not an official Salesforce product and is not affiliated with or endorsed by Salesforce.

## Why this exists

Flow Builder gives custom property editors a `builderContext`, but turning that context into a polished resource picker is substantial work. A useful editor must normalize many resource shapes, understand scalar and collection compatibility, browse screen/action/subflow outputs, traverse record relationships, preserve Flow references, and behave correctly inside Flow Builder's constrained panel.

This project packages that behavior into reusable components so each custom LWC does not have to rebuild it.

## Included components

| Component                       | Purpose                                                                                                                                |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `c/flowConfigEditorBase`        | Base class supplying the whole Flow Builder editor contract: public inputs, configuration events, generic types, and `validate()`.     |
| `c-flow-config-resource-picker` | Search and browse Flow resources, globals, element outputs, records, collections, Apex-defined values, labels, and hierarchy settings. |
| `c-flow-config-value-input`     | One input that accepts either a literal or a compatible Flow resource.                                                                 |
| `c-flow-config-field-picker`    | Select one or multiple fields, reorder multiple selections, and traverse SObject relationships.                                        |
| `c-flow-config-picker-header`   | Shared breadcrumb/header UI used by both picker experiences.                                                                           |
| Utility modules                 | Normalize Flow metadata, create configuration events, resolve schema, position popovers, and coordinate generic SObject types.         |

The core source lives in `force-app`. A complete consuming Flow screen component and custom property editor live separately in `examples` and are not part of a core deployment.

## Quick start

```bash
git clone <your-repository-url>
cd flow-config-editor-kit
npm ci
sf project deploy start --source-dir force-app --target-org my-org
sf org assign permset --name Flow_Config_Editor_Access --target-org my-org
```

To deploy the optional working example:

```bash
sf project deploy start --source-dir examples --target-org my-org
```

See [Getting started](docs/GETTING_STARTED.md) for the integration workflow and [Component API](docs/COMPONENT_API.md) for supported attributes and events.

## Minimal custom property editor

```js
import FlowConfigEditorBase from "c/flowConfigEditorBase";

export default class MyEditor extends FlowConfigEditorBase {
  get defaultValue() {
    return this.input("defaultValue");
  }

  get defaultValueDataType() {
    return this.inputDataType("defaultValue", "String");
  }
}
```

```html
<template>
  <c-flow-config-value-input
    label="Default Value"
    property-name="defaultValue"
    value="{defaultValue}"
    value-data-type="{defaultValueDataType}"
    value-type="String"
    builder-context="{builderContext}"
    automatic-output-variables="{automaticOutputVariables}"
    api-version="{apiVersion}"
    data-validatable
    data-property="defaultValue"
  ></c-flow-config-value-input>
</template>
```

That is the whole editor. `builderContext`, `automaticOutputVariables`, `apiVersion`, and `validate()` come from the base class, and the picker dispatches the standard Flow Builder configuration event itself because `property-name` is supplied.

## Repository layout

```text
force-app/                 Core deployable framework
examples/                  Optional example screen component and editor
docs/                      Integration, API, architecture, and security docs
manifest/                  Core and example deployment manifests
config/                    Scratch-org definition
.github/                   CI and contribution templates
```

## Supported resource families

- Variables, constants, formulas, choices, text templates, and stages
- Get Records, record variables, and record collections
- Screen component, action, and subflow outputs exposed in `builderContext`
- Apex-defined variables and nested Aura-enabled members
- Global variables and constants, including `$Flow`, `$User`, `$Profile`, `$UserRole`, `$Organization`, `$System`, and versioned `$Api` endpoints
- Custom Labels and Custom Hierarchy Settings
- Literal String and Number values through the value input

Availability is still governed by what Salesforce exposes to a custom property editor for the current Flow element and API version. See [Known platform boundaries](docs/LIMITATIONS.md).

## Development

```bash
npm ci
npm run verify
```

`verify` checks API-version consistency, then runs ESLint, all LWC Jest suites, coverage thresholds, and Prettier. The repository currently targets Salesforce API version 67.0.

Use `npm run check:dependencies` during maintenance to report newer compatible npm releases. Dependabot also checks development dependencies weekly. Review major upgrades together with their Node and peer-dependency requirements; never update the lockfile without running the full verification suite.

### AI contributors

Repository-local instructions live in [`AGENTS.md`](AGENTS.md), with focused skills under [`.agents/skills`](.agents/skills):

- `extend-flow-config-kit` for framework features and architecture
- `refine-flow-picker-ui` for picker UX and accessibility
- `validate-flow-config-kit` for tests, packaging, Salesforce validation, and releases

AI coding agents should read `AGENTS.md` first and load every skill relevant to the requested change.

## Design principles

- Keep Flow metadata normalization outside presentation components.
- Share navigation, positioning, icons, filtering, and event construction.
- Preserve Flow Builder values exactly; store references as `{!Resource.Path}`.
- Treat the example as a consumer, not part of the framework.
- Respect object and field accessibility in Apex describe operations.
- Avoid hard-coding org-specific component outputs or Apex-defined classes.

These choices echo the useful base-pack model used by [UnofficialSF's Flow components](https://github.com/UnofficialSF/LightningFlowComponents): stable prefixed building blocks are kept reusable, while consuming components remain independent.

## Documentation

- [Getting started](docs/GETTING_STARTED.md)
- [Component API](docs/COMPONENT_API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Adapting the framework](docs/ADAPTING.md)
- [Security model](SECURITY.md)
- [Known platform boundaries](docs/LIMITATIONS.md)
- [Contributing](CONTRIBUTING.md)

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
