# Example package

This directory contains a reference consumer and is not part of the core framework deployment.

- `flowConfigFrameworkExample` is a Flow screen component with generic record-collection, String, Number, and field-selection properties.
- `flowConfigFrameworkExampleEditor` is its custom property editor and demonstrates two independent collection/field dependencies, single and ordered multiple field selection, literal-or-resource inputs, generic SObject mappings, validation, and resource refresh handling.

Deploy core first, then the example:

```bash
sf project deploy start --source-dir force-app --target-org my-org
sf project deploy start --source-dir examples --target-org my-org
```

The example is intentionally complete rather than minimal. For a new component, copy the relevant patterns into your own editor and keep only the inputs and validation rules your component needs.
