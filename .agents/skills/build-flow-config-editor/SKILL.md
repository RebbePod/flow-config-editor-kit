---
name: build-flow-config-editor
description: Build a Salesforce Flow custom property editor in a consuming project using the Flow Config Editor Kit. Use when adding or changing a configurationEditor LWC for a Flow screen component, wiring record collections to field pickers, persisting generic SObject type mappings, validating editor input, or when a Flow screen component's configuration panel needs resource pickers. This is the consumer-facing skill; use extend-flow-config-kit instead when changing the framework itself.
---

# Build a Flow Config Editor

You are writing a **consumer** of this framework, not changing the framework. Everything you need is in `docs/llms.txt` — read it completely before writing code. It is a single self-contained reference; you should not need any other file.

If the framework is installed in the target org but its source is not in the repository you are editing, work from `docs/llms.txt` alone and do not attempt to modify `force-app`.

## Decide which layer to use

Start declarative. Drop to imperative only for what a schema cannot express.

Use `static flowProperties` when the editor is some combination of:

- scalar String/Number inputs that accept a literal or a Flow resource
- record collections whose object type drives a generic SObject mapping
- field pickers that depend on one of those collections
- required-value validation

Drop to the imperative API when the editor needs:

- conditional or cross-property requiredness
- migration from previously-shipped property names
- a bespoke layout, grouping, or inline explanation
- reaction to a change beyond storing it

Both live on the same base class. Mixing them is expected, not a fallback — declare what fits and override `validateConfiguration()` or `configurationChanged()` for the rest. Never fork the base class or copy a picker to get a variation.

## Build order

1. Write the screen component's `targetConfigs` first. The property names and types there are the contract everything else follows.
2. Give every generic SObject property a `{T}` / `{T[]}` type, and use a distinct letter per independent collection.
3. Write the editor as a subclass of `c/flowConfigEditorBase`.
4. Mark every rendered control `data-validatable` and `data-property="<propertyName>"`.
5. Add Jest tests before declaring the work done.

## Rules that prevent the common failures

- `configurationEditor` takes the kebab-case element name (`c-my-editor`), not the module name.
- Never redeclare `builderContext`, `inputVariables`, `genericTypeMappings`, `automaticOutputVariables`, `elementInfo`, or `validate()` on a subclass.
- `inputVariables` entries are `{ name, value, valueDataType }`; `genericTypeMappings` entries are `{ typeName, typeValue }`. Do not mix the key names.
- Flow references keep their `{!...}` wrapper end to end.
- Clearing an input is `configuration_editor_input_value_changed` with `newValue: null`. There is no deletion event.
- An unmapped generic type blocks Flow activation. If a declared collection can be left empty, map its type to a sensible fallback rather than leaving it null.
- Multiple field selections persist as a JSON array inside a String property.
- Flow Builder publishes its four inputs in no guaranteed order; never assume one has arrived while handling another.
- Discovery must come from `builderContext` or Salesforce metadata. Never hard-code an org's objects, fields, Apex classes, or component names.

## Validate before handing off

Run the consuming project's own checks, and at minimum:

```bash
npm run test:unit
sf project deploy validate --source-dir <your-source-dir> --target-org <scratch-or-dev-org>
```

Confirm in Flow Builder itself, not only in tests: open the element, save, reopen, and check that the saved selection is restored and that clearing it stays cleared after Flow Builder rehydrates the editor.

Report what you verified and what you could not.
