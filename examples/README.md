# Example package

This directory contains a reference consumer and is not part of the core framework deployment.

- `flowConfigFrameworkExample` is a Flow screen component with generic record-collection, String, Number, object API-name, and field-selection properties.
- `flowConfigDeclarativeExampleEditor` is the short end of the framework: one file, no template, no event handlers. Start here.
- `flowConfigFrameworkExampleEditor` is the long end. It extends the same base class but drops to the imperative API for the things a schema deliberately does not express — two independent collection/field dependencies, legacy property migration, generic-mapping repair, and field-reset notices.

Read them in that order. Together they show that adopting the schema is not a one-way door: both editors share a base class, and an editor can declare what fits and override the rest.

The full editor also demonstrates the direct object picker, a dependent single-field picker, an ordered multi-field picker, a non-sortable multi-select, and the optional field/custom-value switch. The example keeps each behavior visible in one Flow configuration panel so it can be used as a manual interaction fixture as well as sample code.

Deploy core first, then the example:

```bash
sf project deploy start --source-dir force-app --target-org my-org
sf project deploy start --source-dir examples --target-org my-org
```

The example is intentionally complete rather than minimal. For a new component, copy the relevant patterns into your own editor and keep only the inputs and validation rules your component needs.
