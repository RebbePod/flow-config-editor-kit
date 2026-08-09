import { LightningElement, api } from "lwc";
import {
  createGenericTypeMappingChangedEvent,
  createInputValueChangedEvent,
  createInputValueDeletedEvent,
  getInputVariable,
  getInputValue
} from "c/flowConfigEditorUtils";
import { planCollectionChange } from "c/flowConfigGenericTypeCoordinator";

export default class FlowConfigFrameworkExampleEditor extends LightningElement {
  @api elementInfo;

  _builderContext = {};
  _inputVariables = [];
  _genericTypeMappings = [];
  _automaticOutputVariables = {};
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
  validationErrors = [];
  repairedMappingKey = "";
  mappingRepairScheduled = false;

  @api
  get builderContext() {
    return this._builderContext;
  }
  set builderContext(value) {
    this._builderContext = this.cloneBuilderContext(value);
  }

  @api
  get automaticOutputVariables() {
    return this._automaticOutputVariables;
  }
  set automaticOutputVariables(value) {
    this._automaticOutputVariables = this.cloneAutomaticOutputs(value);
  }

  cloneBuilderContext(value) {
    const context = value || {};
    return {
      ...context,
      screens: [...(context.screens || [])]
    };
  }

  cloneAutomaticOutputs(value) {
    if (!value || typeof value === "string" || Array.isArray(value)) {
      return value || {};
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, outputs]) => [
        key,
        Array.isArray(outputs) ? [...outputs] : outputs
      ])
    );
  }

  @api
  get inputVariables() {
    return this._inputVariables;
  }
  set inputVariables(value) {
    this._inputVariables = value || [];
    const legacyRecords = getInputValue(
      this._inputVariables,
      "records",
      null,
      true
    );
    const legacyObjectApiName = getInputValue(
      this._inputVariables,
      "objectApiName",
      this.legacyMappedObjectType
    );
    this.singleRecords = getInputValue(
      this._inputVariables,
      "singleRecords",
      legacyRecords,
      true
    );
    this.multipleRecords = getInputValue(
      this._inputVariables,
      "multipleRecords",
      null,
      true
    );
    this.singleObjectApiName = getInputValue(
      this._inputVariables,
      "singleObjectApiName",
      this.singleMappedObjectType || legacyObjectApiName
    );
    this.multipleObjectApiName = getInputValue(
      this._inputVariables,
      "multipleObjectApiName",
      this.multipleMappedObjectType
    );
    this.singleFieldApiName = getInputValue(
      this._inputVariables,
      "singleFieldApiName",
      null
    );
    const legacyDisplayField = getInputValue(
      this._inputVariables,
      "displayFieldApiName",
      null
    );
    this.displayFieldsJson = getInputValue(
      this._inputVariables,
      "displayFieldsJson",
      legacyDisplayField ? JSON.stringify([legacyDisplayField]) : null
    );
    const textVariable = getInputVariable(this._inputVariables, "textValue");
    const numberVariable = getInputVariable(
      this._inputVariables,
      "numberValue"
    );
    this.textValue = getInputValue(this._inputVariables, "textValue", null);
    this.textValueDataType = textVariable?.valueDataType || "String";
    this.numberValue = getInputValue(this._inputVariables, "numberValue", null);
    this.numberValueDataType = numberVariable?.valueDataType || "Number";
    this.flowRuntimeApiVersion = getInputValue(
      this._inputVariables,
      "flowRuntimeApiVersion",
      null
    );
  }

  @api
  get genericTypeMappings() {
    return this._genericTypeMappings;
  }
  set genericTypeMappings(value) {
    this._genericTypeMappings = value || [];
    if (!this.singleObjectApiName && this.singleMappedObjectType) {
      this.singleObjectApiName = this.singleMappedObjectType;
    }
    if (!this.multipleObjectApiName && this.multipleMappedObjectType) {
      this.multipleObjectApiName = this.multipleMappedObjectType;
    }
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

  repairUnusedGenericTypeMappings() {
    const fallbackObjectType =
      this.singleObjectApiName || this.singleMappedObjectType;
    if (!fallbackObjectType) {
      return;
    }

    const repairs = [];
    if (!this.multipleRecords && !this.multipleMappedObjectType) {
      repairs.push(["TMultiple", fallbackObjectType]);
    }

    const repairKey = repairs
      .map(([typeName, typeValue]) => `${typeName}:${typeValue}`)
      .join("|");
    if (!repairKey || repairKey === this.repairedMappingKey) {
      return;
    }
    this.repairedMappingKey = repairKey;
    repairs.forEach(([typeName, typeValue]) => {
      this.dispatchEvent(
        createGenericTypeMappingChangedEvent(typeName, typeValue)
      );
    });
  }

  get legacyMappedObjectType() {
    return (
      this._genericTypeMappings.find((mapping) => mapping.typeName === "T")
        ?.typeValue || null
    );
  }

  get singleMappedObjectType() {
    return (
      this._genericTypeMappings.find(
        (mapping) => mapping.typeName === "TSingle"
      )?.typeValue || null
    );
  }

  get multipleMappedObjectType() {
    return (
      this._genericTypeMappings.find(
        (mapping) => mapping.typeName === "TMultiple"
      )?.typeValue || null
    );
  }

  get effectiveApiVersion() {
    return (
      this.flowRuntimeApiVersion ||
      this._builderContext.flowRuntimeApiVersion ||
      this._builderContext.apiVersion ||
      this.elementInfo?.flowRuntimeApiVersion ||
      this.elementInfo?.apiVersion ||
      null
    );
  }

  handleSingleRecordsChange(event) {
    this.handleRecordsChange("single", event);
  }

  handleMultipleRecordsChange(event) {
    this.handleRecordsChange("multiple", event);
  }

  handleRecordsChange(mode, event) {
    this.validationErrors = [];
    const { newValue, resource } = event.detail;
    const isSingle = mode === "single";
    const recordsProperty = isSingle ? "singleRecords" : "multipleRecords";
    const objectProperty = isSingle
      ? "singleObjectApiName"
      : "multipleObjectApiName";
    const fieldProperty = isSingle ? "singleFieldApiName" : "displayFieldsJson";
    const typeName = isSingle ? "TSingle" : "TMultiple";
    const currentObjectType = this[objectProperty];
    const hadDependentSelection = Boolean(this[fieldProperty]);
    this[recordsProperty] = newValue;
    const nextObjectType = resource?.objectType || null;
    const transition = planCollectionChange({
      newValue,
      objectType: nextObjectType,
      currentObjectType,
      dependentValue: this[fieldProperty],
      fallbackObjectType:
        !newValue && !isSingle ? this.singleObjectApiName : null
    });
    if (!transition.changed) {
      return;
    }
    this[objectProperty] = transition.nextObjectType;
    this[fieldProperty] = null;
    if (transition.showResetNotice && hadDependentSelection) {
      this.showFieldResetNotice(mode);
    }
    this.dispatchCollectionTypeChange({
      isSingle,
      typeName,
      objectProperty,
      fieldProperty,
      objectType: transition.nextObjectType
    });
  }

  dispatchCollectionTypeChange({
    isSingle,
    typeName,
    objectProperty,
    fieldProperty,
    objectType
  }) {
    this.dispatchEvent(
      createGenericTypeMappingChangedEvent(typeName, objectType)
    );
    if (
      isSingle &&
      objectType &&
      !this.multipleRecords &&
      !this.multipleMappedObjectType
    ) {
      this.repairedMappingKey = `TMultiple:${objectType}`;
      this.dispatchEvent(
        createGenericTypeMappingChangedEvent("TMultiple", objectType)
      );
    }
    this.dispatchEvent(
      objectType
        ? createInputValueChangedEvent(objectProperty, objectType, "String")
        : createInputValueDeletedEvent(objectProperty)
    );
    this.dispatchEvent(createInputValueDeletedEvent(fieldProperty));
  }

  handleFieldChange(event) {
    this.validationErrors = [];
    if (event.detail.name === "singleFieldApiName") {
      this.singleFieldApiName = event.detail.newValue;
      this.clearFieldResetNotice("single");
    } else {
      this.displayFieldsJson = event.detail.newValue;
      this.clearFieldResetNotice("multiple");
      this.dispatchEvent(createInputValueDeletedEvent("displayFieldApiName"));
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
    this.validationErrors = [];
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
    this.dispatchEvent(
      createInputValueChangedEvent(
        name,
        currentValue,
        currentValueDataType || "String"
      )
    );
  }

  @api
  validate() {
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

    const errorsByKey = new Map(
      errors.map((error) => [error.key, error.errorString])
    );
    this.template
      .querySelectorAll("[data-validatable]")
      .forEach((component) => {
        const key = component.dataset.property;
        component.setCustomValidity?.(errorsByKey.get(key) || "");
        component.reportValidity();
        if (component.validationMessage && !errorsByKey.has(key)) {
          const errorString = component.validationMessage;
          errors.push({ key, errorString });
          errorsByKey.set(key, errorString);
        }
      });
    this.validationErrors = errors;
    return errors;
  }

  get hasValidationErrors() {
    return this.validationErrors.length > 0;
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
