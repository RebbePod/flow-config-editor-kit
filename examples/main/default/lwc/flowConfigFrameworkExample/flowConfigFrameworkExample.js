import { LightningElement, api } from "lwc";

export default class FlowConfigFrameworkExample extends LightningElement {
  @api records = [];
  @api objectApiName;
  @api singleRecords = [];
  @api singleObjectApiName;
  @api multipleRecords = [];
  @api multipleObjectApiName;
  @api singleFieldApiName;
  @api displayFieldApiName;
  @api displayFieldsJson;
  @api textValue;
  @api numberValue;
  @api flowRuntimeApiVersion;

  get displayFields() {
    let multipleFields = [];
    try {
      const fields = JSON.parse(this.displayFieldsJson || "[]");
      multipleFields = Array.isArray(fields) ? fields : [];
    } catch {
      multipleFields = [];
    }
    return [
      ...new Set(
        [
          this.singleFieldApiName,
          ...multipleFields,
          this.displayFieldApiName
        ].filter(Boolean)
      )
    ];
  }

  get multipleDisplayFields() {
    try {
      const fields = JSON.parse(this.displayFieldsJson || "[]");
      return Array.isArray(fields) ? fields : [];
    } catch {
      return [];
    }
  }

  get previewRecords() {
    return (
      this.singleRecords?.length ? this.singleRecords : this.records || []
    )
      .slice(0, 10)
      .map((record, index) => ({
        id: record.Id || `row-${index}`,
        value: this.singleFieldApiName
          ? this.readFieldPath(record, this.singleFieldApiName) || "(blank)"
          : "(no field selected)"
      }));
  }

  get multiplePreviewRecords() {
    const fields = this.multipleDisplayFields;
    return (this.multipleRecords || []).slice(0, 10).map((record, index) => ({
      id: record.Id || `multiple-row-${index}`,
      value: fields.length
        ? fields
            .map((fieldName) => this.readFieldPath(record, fieldName))
            .filter(
              (value) => value !== undefined && value !== null && value !== ""
            )
            .join(" · ") || "(blank)"
        : "(no fields selected)"
    }));
  }

  get hasRecords() {
    return this.previewRecords.length > 0;
  }

  get hasMultipleRecords() {
    return this.multiplePreviewRecords.length > 0;
  }

  readFieldPath(record, path) {
    if (!record || !path) {
      return undefined;
    }
    if (Object.prototype.hasOwnProperty.call(record, path)) {
      return record[path];
    }
    return path.split(".").reduce((value, segment) => value?.[segment], record);
  }
}
