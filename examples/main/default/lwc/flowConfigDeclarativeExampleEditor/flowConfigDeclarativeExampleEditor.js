import FlowConfigEditorBase from "c/flowConfigEditorBase";

/**
 * The same framework as the fuller example, declared instead of wired.
 *
 * There is no template and no event plumbing: the schema below is the entire
 * editor. Compare with `flowConfigFrameworkExampleEditor`, which drops to the
 * imperative API because it needs reset notices, legacy property migration,
 * and mapping repair that a schema deliberately does not express.
 */
export default class FlowConfigDeclarativeExampleEditor extends FlowConfigEditorBase {
  static flowProperties = {
    records: {
      type: "SObject",
      collection: true,
      label: "Record Collection",
      genericType: "T",
      objectProperty: "objectApiName",
      required: true,
      helpText: "Provides the record type used by the field selectors below."
    },
    displayField: {
      type: "field",
      dependsOn: "records",
      label: "Display Field",
      required: true,
      helpText: "Shown as the primary label for each record."
    },
    sortFields: {
      type: "field",
      dependsOn: "records",
      multiple: true,
      label: "Sort Fields",
      helpText: "Ordered. Drag to change precedence."
    },
    heading: {
      type: "String",
      label: "Heading",
      helpText: "Literal text or any compatible Flow resource."
    },
    pageSize: {
      type: "Number",
      label: "Page Size"
    }
  };
}
