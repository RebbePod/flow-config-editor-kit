import FlowConfigEditorBase from "c/flowConfigEditorBase";

/**
 * Reference custom property editor.
 *
 * Everything Flow Builder requires of every editor — reading `inputVariables`,
 * dispatching configuration events, keeping generic type mappings in step, and
 * answering `validate()` — comes from `c/flowConfigEditorBase`. What remains
 * here is only this component's own rules: which inputs exist, which collection
 * feeds which field picker, and what counts as valid.
 */
export default class FlowConfigFrameworkExampleEditor extends FlowConfigEditorBase {
  singleRecords = null;
  singleObjectApiName = null;
  multipleRecords = null;
  multipleObjectApiName = null;
  singleFieldApiName = null;
  displayFieldsJson = null;
  textValue = null;
  textValueDataType = "String";
  numberValue = null;
  numberValueDataType = "Number";
  flowRuntimeApiVersion;
  singleResetMessage = "";
  multipleResetMessage = "";
  singleResetTimer;
  multipleResetTimer;
  repairedMappingKey = "";
  mappingRepairScheduled = false;

  configurationChanged(source) {
    if (source === "inputVariables") {
      this.hydrateFromInputVariables();
    } else if (source === "genericTypeMappings") {
      this.adoptMappedObjectTypes();
    }
  }

  /**
   * Flow Builder may publish `inputVariables` and `genericTypeMappings` in
   * either order, so each source fills in what the other has not supplied yet.
   */
  hydrateFromInputVariables() {
    const legacyRecords = this.reference("records");
    const legacyObjectApiName = this.input(
      "objectApiName",
      this.genericType("T")
    );
    this.singleRecords = this.reference("singleRecords", legacyRecords);
    this.multipleRecords = this.reference("multipleRecords");
    this.singleObjectApiName = this.input(
      "singleObjectApiName",
      this.genericType("TSingle") || legacyObjectApiName
    );
    this.multipleObjectApiName = this.input(
      "multipleObjectApiName",
      this.genericType("TMultiple")
    );
    this.singleFieldApiName = this.input("singleFieldApiName");
    const legacyDisplayField = this.input("displayFieldApiName");
    this.displayFieldsJson = this.input(
      "displayFieldsJson",
      legacyDisplayField ? JSON.stringify([legacyDisplayField]) : null
    );
    this.textValue = this.input("textValue");
    this.textValueDataType = this.inputDataType("textValue", "String");
    this.numberValue = this.input("numberValue");
    this.numberValueDataType = this.inputDataType("numberValue", "Number");
    this.flowRuntimeApiVersion = this.input("flowRuntimeApiVersion");
  }

  adoptMappedObjectTypes() {
    this.singleObjectApiName ||= this.genericType("TSingle");
    this.multipleObjectApiName ||= this.genericType("TMultiple");
  }

  renderedCallback() {
    if (this.mappingRepairScheduled) {
      return;
    }
    this.mappingRepairScheduled = true;
    Promise.resolve().then(() => {
      this.mappingRepairScheduled = false;
      this.repairUnusedGenericTypeMappings();
    });
  }

  /**
   * A generic type left unmapped blocks Flow activation, so an unused second
   * collection inherits the object type of the one that is configured.
   */
  repairUnusedGenericTypeMappings() {
    const fallbackObjectType =
      this.singleObjectApiName || this.genericType("TSingle");
    if (!fallbackObjectType) {
      return;
    }
    if (this.multipleRecords || this.genericType("TMultiple")) {
      return;
    }
    const repairKey = `TMultiple:${fallbackObjectType}`;
    if (repairKey === this.repairedMappingKey) {
      return;
    }
    this.repairedMappingKey = repairKey;
    this.setGenericType("TMultiple", fallbackObjectType);
  }

  get effectiveApiVersion() {
    return this.flowRuntimeApiVersion || this.apiVersion;
  }

  handleSingleRecordsChange(event) {
    this.handleRecordsChange("single", event);
  }

  handleMultipleRecordsChange(event) {
    this.handleRecordsChange("multiple", event);
  }

  handleRecordsChange(mode, event) {
    this.clearErrors();
    const { newValue, resource } = event.detail;
    const isSingle = mode === "single";
    const objectProperty = isSingle
      ? "singleObjectApiName"
      : "multipleObjectApiName";
    const dependentProperty = isSingle
      ? "singleFieldApiName"
      : "displayFieldsJson";
    const hadDependentSelection = Boolean(this[dependentProperty]);

    this[isSingle ? "singleRecords" : "multipleRecords"] = newValue;

    const transition = this.applyCollectionChange({
      objectProperty,
      dependentProperty,
      typeName: isSingle ? "TSingle" : "TMultiple",
      newValue,
      objectType: resource?.objectType || null,
      currentObjectType: this[objectProperty],
      dependentValue: this[dependentProperty],
      fallbackObjectType:
        !newValue && !isSingle ? this.singleObjectApiName : null
    });
    if (!transition.changed) {
      return;
    }

    this[objectProperty] = transition.nextObjectType;
    this[dependentProperty] = null;
    if (transition.showResetNotice && hadDependentSelection) {
      this.showFieldResetNotice(mode);
    }
    if (
      isSingle &&
      transition.nextObjectType &&
      !this.multipleRecords &&
      !this.genericType("TMultiple")
    ) {
      this.repairedMappingKey = `TMultiple:${transition.nextObjectType}`;
      this.setGenericType("TMultiple", transition.nextObjectType);
    }
  }

  handleFieldChange(event) {
    this.clearErrors();
    if (event.detail.name === "singleFieldApiName") {
      this.singleFieldApiName = event.detail.newValue;
      this.clearFieldResetNotice("single");
    } else {
      this.displayFieldsJson = event.detail.newValue;
      this.clearFieldResetNotice("multiple");
      this.clearInput("displayFieldApiName");
    }
  }

  showFieldResetNotice(mode) {
    const messageProperty =
      mode === "single" ? "singleResetMessage" : "multipleResetMessage";
    const timerProperty =
      mode === "single" ? "singleResetTimer" : "multipleResetTimer";
    window.clearTimeout(this[timerProperty]);
    this[messageProperty] =
      "Field selection reset because the record type changed.";
    // Keep the dependency explanation visible long enough to be noticed.
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    this[timerProperty] = window.setTimeout(() => {
      this[messageProperty] = "";
      this[timerProperty] = null;
    }, 5000);
  }

  clearFieldResetNotice(mode) {
    const messageProperty =
      mode === "single" ? "singleResetMessage" : "multipleResetMessage";
    const timerProperty =
      mode === "single" ? "singleResetTimer" : "multipleResetTimer";
    window.clearTimeout(this[timerProperty]);
    this[timerProperty] = null;
    this[messageProperty] = "";
  }

  disconnectedCallback() {
    window.clearTimeout(this.singleResetTimer);
    window.clearTimeout(this.multipleResetTimer);
  }

  handleValueChange(event) {
    this.clearErrors();
    const { name, newValue, newValueDataType } = event.detail;
    if (name === "textValue") {
      this.textValue = newValue;
      this.textValueDataType = newValueDataType;
    } else if (name === "numberValue") {
      this.numberValue = newValue;
      this.numberValueDataType = newValueDataType;
    }
  }

  handleResourceRefresh(event) {
    event.stopPropagation();
    const { name, currentValue, currentValueDataType } = event.detail;
    if (!name) {
      return;
    }
    // A state-neutral configuration event asks Flow Builder to republish its
    // current automaticOutputVariables, including unsaved screen components.
    this.setInput(name, currentValue, currentValueDataType || "String");
  }

  validateConfiguration() {
    const errors = [];
    if (!this.singleRecords) {
      errors.push({
        key: "singleRecords",
        errorString:
          "Single Record Collection is required. Select the collection that provides fields for Single Field."
      });
    } else if (!this.singleObjectApiName) {
      errors.push({
        key: "singleRecords",
        errorString:
          "Single Record Collection must have a known Salesforce object type."
      });
    }
    if (this.multipleRecords && !this.multipleObjectApiName) {
      errors.push({
        key: "multipleRecords",
        errorString:
          "Multiple Record Collection must have a known Salesforce object type."
      });
    }
    if (!this.isValidDisplayFieldsJson) {
      errors.push({
        key: "displayFieldsJson",
        errorString:
          "Multiple Fields contains an invalid value. Select one or more fields again."
      });
    }
    if (!this.isValidNumberValue) {
      errors.push({
        key: "numberValue",
        errorString:
          "Number Input must be a number or a compatible Flow resource."
      });
    }
    return errors;
  }

  get isValidDisplayFieldsJson() {
    if (!this.displayFieldsJson) {
      return true;
    }
    try {
      const fields = JSON.parse(this.displayFieldsJson);
      return (
        Array.isArray(fields) &&
        fields.length > 0 &&
        fields.every(
          (field) => typeof field === "string" && Boolean(field.trim())
        )
      );
    } catch {
      return false;
    }
  }

  get isValidNumberValue() {
    if (
      this.numberValue === null ||
      this.numberValue === undefined ||
      this.numberValue === "" ||
      String(this.numberValueDataType).toLowerCase() === "reference"
    ) {
      return true;
    }
    return Number.isFinite(Number(this.numberValue));
  }
}
