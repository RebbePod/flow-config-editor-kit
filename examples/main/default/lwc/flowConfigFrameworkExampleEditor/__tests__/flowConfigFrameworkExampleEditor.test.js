import { createElement } from "lwc";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import FlowConfigFrameworkExampleEditor from "c/flowConfigFrameworkExampleEditor";

function flushPromises() {
  return Promise.resolve();
}

jest.mock(
  "@salesforce/apex/FlowConfigApexTypeController.describeType",
  () => ({ __esModule: true, default: jest.fn() }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/FlowConfigApexTypeController.describeSObjectPath",
  () => ({ __esModule: true, default: jest.fn() }),
  { virtual: true }
);
jest.mock(
  "@salesforce/apex/FlowConfigApexTypeController.describeObjects",
  () => ({ __esModule: true, default: jest.fn().mockResolvedValue([]) }),
  { virtual: true }
);

describe("c-flow-config-framework-example-editor", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("returns a specific records error and displays it inline", async () => {
    const element = createElement("c-flow-config-framework-example-editor", {
      is: FlowConfigFrameworkExampleEditor
    });
    element.inputVariables = [];
    document.body.appendChild(element);

    expect(element.validate()).toEqual([
      {
        key: "singleRecords",
        errorString:
          "Single Record Collection is required. Select the collection that provides fields for Single Field."
      }
    ]);
    expect(
      element.shadowRoot.querySelector('[data-property="singleRecords"]')
        .validationMessage
    ).toContain("Single Record Collection is required");
    expect(
      element.shadowRoot.querySelector('[data-property="multipleRecords"]')
        .validationMessage
    ).toBe("");
    await flushPromises();
    expect(
      element.shadowRoot.querySelector(".editor-errors").textContent
    ).toContain("Single Record Collection is required");
  });

  it("passes validation with no multiple collection when single is valid", () => {
    const element = createElement("c-flow-config-framework-example-editor", {
      is: FlowConfigFrameworkExampleEditor
    });
    element.genericTypeMappings = [
      { typeName: "TSingle", typeValue: "Contact" }
    ];
    element.inputVariables = [
      {
        name: "singleRecords",
        value: "{!Get_Contacts}",
        valueDataType: "reference"
      }
    ];
    document.body.appendChild(element);

    expect(element.validate()).toEqual([]);
    expect(
      element.shadowRoot.querySelector('[data-property="multipleRecords"]')
        .required
    ).toBe(false);
  });

  it("restores and connects the direct object and field picker example", () => {
    const element = createElement("c-flow-config-framework-example-editor", {
      is: FlowConfigFrameworkExampleEditor
    });
    element.genericTypeMappings = [
      { typeName: "TSingle", typeValue: "Contact" }
    ];
    element.inputVariables = [
      {
        name: "singleRecords",
        value: "{!Get_Contacts}",
        valueDataType: "reference"
      },
      {
        name: "directObjectApiName",
        value: "Account",
        valueDataType: "String"
      },
      {
        name: "directFieldApiName",
        value: "Name",
        valueDataType: "String"
      }
    ];
    document.body.appendChild(element);

    const objectPicker = element.shadowRoot.querySelector(
      '[data-property="directObjectApiName"]'
    );
    const fieldPicker = element.shadowRoot.querySelector(
      '[data-property="directFieldApiName"]'
    );
    expect(objectPicker.value).toBe("Account");
    expect(objectPicker.queryableOnly).toBe(true);
    expect(fieldPicker.value).toBe("Name");
    expect(fieldPicker.objectApiName).toBe("Account");
  });

  it("clears a direct field when its selected object changes", async () => {
    const element = createElement("c-flow-config-framework-example-editor", {
      is: FlowConfigFrameworkExampleEditor
    });
    element.genericTypeMappings = [
      { typeName: "TSingle", typeValue: "Contact" }
    ];
    element.inputVariables = [
      {
        name: "singleRecords",
        value: "{!Get_Contacts}",
        valueDataType: "reference"
      },
      {
        name: "directObjectApiName",
        value: "Account",
        valueDataType: "String"
      },
      {
        name: "directFieldApiName",
        value: "Name",
        valueDataType: "String"
      }
    ];
    const inputHandler = jest.fn();
    element.addEventListener(
      "configuration_editor_input_value_changed",
      inputHandler
    );
    document.body.appendChild(element);

    element.shadowRoot
      .querySelector('[data-property="directObjectApiName"]')
      .dispatchEvent(
        new CustomEvent("objectchange", {
          detail: { newValue: "Contact", objectType: "Contact" }
        })
      );
    await flushPromises();

    expect(
      element.shadowRoot.querySelector('[data-property="directFieldApiName"]')
        .objectApiName
    ).toBe("Contact");
    expect(
      inputHandler.mock.calls.map((call) => call[0].detail)
    ).toContainEqual({
      name: "directFieldApiName",
      newValue: null,
      newValueDataType: "String"
    });
    expect(
      element.shadowRoot.querySelector(".field-reset-notice").textContent
    ).toContain("direct object changed");
  });

  it("returns the picker's specific error for an unsupported global field", async () => {
    const element = createElement("c-flow-config-framework-example-editor", {
      is: FlowConfigFrameworkExampleEditor
    });
    element.genericTypeMappings = [
      { typeName: "TSingle", typeValue: "Contact" }
    ];
    element.inputVariables = [
      {
        name: "singleRecords",
        value: "{!Get_Contacts}",
        valueDataType: "reference"
      },
      {
        name: "textValue",
        value: "{!$User.Name}",
        valueDataType: "reference"
      }
    ];
    document.body.appendChild(element);
    getObjectInfo.emit({
      apiName: "User",
      fields: {
        Name: {
          apiName: "Name",
          label: "Full Name",
          dataType: "String",
          compound: true
        }
      }
    });
    await flushPromises();

    expect(element.validate()).toEqual([
      {
        key: "textValue",
        errorString:
          "Running User > Full Name is a compound field that Flow can't use directly here. Select one of its scalar fields instead, or create a compatible Flow formula."
      }
    ]);
  });

  it("repairs unused generic mappings from the selected single collection", async () => {
    const element = createElement("c-flow-config-framework-example-editor", {
      is: FlowConfigFrameworkExampleEditor
    });
    element.genericTypeMappings = [
      { typeName: "TSingle", typeValue: "Contact" }
    ];
    element.inputVariables = [
      {
        name: "singleRecords",
        value: "{!Get_Contacts}",
        valueDataType: "reference"
      }
    ];
    const mappingHandler = jest.fn();
    element.addEventListener(
      "configuration_editor_generic_type_mapping_changed",
      mappingHandler
    );
    document.body.appendChild(element);
    await flushPromises();

    expect(mappingHandler.mock.calls.map((call) => call[0].detail)).toEqual([
      { typeName: "TMultiple", typeValue: "Contact" }
    ]);
  });

  it("reports invalid multiple-field JSON and numeric literals by property", () => {
    const element = createElement("c-flow-config-framework-example-editor", {
      is: FlowConfigFrameworkExampleEditor
    });
    element.genericTypeMappings = [
      { typeName: "TSingle", typeValue: "Contact" },
      { typeName: "TMultiple", typeValue: "Contact" }
    ];
    element.inputVariables = [
      {
        name: "singleRecords",
        value: "{!Get_Contacts}",
        valueDataType: "reference"
      },
      {
        name: "multipleRecords",
        value: "{!Get_Contacts}",
        valueDataType: "reference"
      },
      { name: "displayFieldsJson", value: "not-json", valueDataType: "String" },
      { name: "numberValue", value: "abc", valueDataType: "Number" }
    ];
    document.body.appendChild(element);

    expect(element.validate()).toEqual([
      expect.objectContaining({ key: "displayFieldsJson" }),
      expect.objectContaining({ key: "numberValue" })
    ]);
  });

  it("keeps the two collection and field dependencies independent", async () => {
    const element = createElement("c-flow-config-framework-example-editor", {
      is: FlowConfigFrameworkExampleEditor
    });
    element.genericTypeMappings = [
      { typeName: "TSingle", typeValue: "Contact" },
      { typeName: "TMultiple", typeValue: "Account" }
    ];
    element.inputVariables = [
      {
        name: "singleRecords",
        value: "{!Get_Contacts}",
        valueDataType: "reference"
      },
      {
        name: "multipleRecords",
        value: "{!Get_Accounts}",
        valueDataType: "reference"
      },
      {
        name: "singleFieldApiName",
        value: "Name",
        valueDataType: "String"
      },
      {
        name: "displayFieldsJson",
        value: '["Name"]',
        valueDataType: "String"
      }
    ];
    const mappingHandler = jest.fn();
    element.addEventListener(
      "configuration_editor_generic_type_mapping_changed",
      mappingHandler
    );
    document.body.appendChild(element);

    element.shadowRoot
      .querySelector('[data-property="singleRecords"]')
      .dispatchEvent(
        new CustomEvent("resourcechange", {
          detail: {
            newValue: "{!Get_Leads}",
            resource: { objectType: "Lead" }
          }
        })
      );
    await flushPromises();

    expect(
      mappingHandler.mock.calls.map((call) => call[0].detail)
    ).toContainEqual({
      typeName: "TSingle",
      typeValue: "Lead"
    });
    expect(
      element.shadowRoot.querySelector('[data-property="singleFieldApiName"]')
        .objectApiName
    ).toBe("Lead");
    expect(
      element.shadowRoot.querySelector('[data-property="displayFieldsJson"]')
        .objectApiName
    ).toBe("Account");
    expect(
      element.shadowRoot.querySelector(".field-reset-notice").textContent
    ).toContain("Field selection reset because the record type changed");
    expect(
      element.shadowRoot.querySelectorAll(".dependent-field")
    ).toHaveLength(3);
  });

  it("clears stale field state when a pasted collection type cannot be resolved", async () => {
    const element = createElement("c-flow-config-framework-example-editor", {
      is: FlowConfigFrameworkExampleEditor
    });
    element.genericTypeMappings = [
      { typeName: "TSingle", typeValue: "Contact" }
    ];
    element.inputVariables = [
      {
        name: "singleRecords",
        value: "{!Get_Contacts}",
        valueDataType: "reference"
      },
      {
        name: "singleFieldApiName",
        value: "Name",
        valueDataType: "String"
      }
    ];
    document.body.appendChild(element);
    const mappingHandler = jest.fn();
    const changeHandler = jest.fn();
    element.addEventListener(
      "configuration_editor_generic_type_mapping_changed",
      mappingHandler
    );
    element.addEventListener(
      "configuration_editor_input_value_changed",
      changeHandler
    );

    element.shadowRoot
      .querySelector('[data-property="singleRecords"]')
      .dispatchEvent(
        new CustomEvent("resourcechange", {
          detail: { newValue: "{!UnknownCollection}", resource: null }
        })
      );
    await flushPromises();

    expect(mappingHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { typeName: "TSingle", typeValue: null }
      })
    );
    expect(
      changeHandler.mock.calls
        .filter((call) => call[0].detail.newValue === null)
        .map((call) => call[0].detail.name)
    ).toEqual(
      expect.arrayContaining(["singleObjectApiName", "singleFieldApiName"])
    );
    expect(
      element.shadowRoot.querySelector('[data-property="singleFieldApiName"]')
        .objectApiName
    ).toBeNull();
  });

  it("starts both collection field selectors without default fields", () => {
    const element = createElement("c-flow-config-framework-example-editor", {
      is: FlowConfigFrameworkExampleEditor
    });
    element.genericTypeMappings = [
      { typeName: "TSingle", typeValue: "Contact" },
      { typeName: "TMultiple", typeValue: "Opportunity" }
    ];
    element.inputVariables = [
      {
        name: "singleRecords",
        value: "{!Get_Contacts}",
        valueDataType: "reference"
      },
      {
        name: "multipleRecords",
        value: "{!Get_Opportunities}",
        valueDataType: "reference"
      }
    ];
    document.body.appendChild(element);

    expect(
      element.shadowRoot.querySelector('[data-property="singleFieldApiName"]')
        .value
    ).toBeNull();
    expect(
      element.shadowRoot.querySelector('[data-property="displayFieldsJson"]')
        .value
    ).toBeNull();
  });

  it("requests fresh automatic outputs when a resource picker opens", async () => {
    const element = createElement("c-flow-config-framework-example-editor", {
      is: FlowConfigFrameworkExampleEditor
    });
    element.builderContext = { screens: [] };
    const refreshHandler = jest.fn((event) => {
      if (event.detail.name === "textValue") {
        element.automaticOutputVariables = {
          NewlyAddedComponent: [
            {
              apiName: "result",
              label: "Result",
              dataType: "String",
              isOutput: true,
              maxOccurs: 1
            }
          ]
        };
      }
    });
    element.addEventListener(
      "configuration_editor_input_value_changed",
      refreshHandler
    );
    document.body.appendChild(element);

    const valueInput = element.shadowRoot.querySelector(
      '[data-property="textValue"]'
    );
    const picker = valueInput.shadowRoot.querySelector(
      "c-flow-config-resource-picker"
    );
    picker.shadowRoot
      .querySelector("lightning-input")
      .dispatchEvent(new CustomEvent("focus"));
    await flushPromises();
    await flushPromises();

    expect(refreshHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: {
          name: "textValue",
          newValue: null,
          newValueDataType: "String"
        }
      })
    );
    expect(picker.shadowRoot.querySelector(".results").textContent).toContain(
      "NewlyAddedComponent"
    );
  });
});
