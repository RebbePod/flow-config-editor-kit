import { createElement } from "lwc";
import FlowConfigDeclarativeExampleEditor from "c/flowConfigDeclarativeExampleEditor";

function flushPromises() {
  return Promise.resolve();
}

function buildEditor() {
  const element = createElement("c-flow-config-declarative-example-editor", {
    is: FlowConfigDeclarativeExampleEditor
  });
  element.builderContext = {
    variables: [
      {
        name: "accountList",
        dataType: "SObject",
        objectType: "Account",
        isCollection: true
      }
    ]
  };
  return element;
}

function form(element) {
  return element.shadowRoot.querySelector("c-flow-config-editor-form");
}

function control(element, property) {
  return form(element).shadowRoot.querySelector(
    `[data-property="${property}"]`
  );
}

describe("c-flow-config-declarative-example-editor", () => {
  afterEach(() => {
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders one control per declared property, in declaration order", async () => {
    const element = buildEditor();
    document.body.appendChild(element);
    await flushPromises();

    const rendered = Array.from(
      form(element).shadowRoot.querySelectorAll("[data-property]")
    ).map((node) => node.dataset.property);

    expect(rendered).toEqual([
      "records",
      "displayField",
      "sortFields",
      "heading",
      "pageSize"
    ]);
  });

  it("chooses the control type from the declared property type", async () => {
    const element = buildEditor();
    document.body.appendChild(element);
    await flushPromises();

    expect(control(element, "records").tagName.toLowerCase()).toContain(
      "resource-picker"
    );
    expect(control(element, "displayField").tagName.toLowerCase()).toContain(
      "field-picker"
    );
    expect(control(element, "heading").tagName.toLowerCase()).toContain(
      "value-input"
    );
    expect(control(element, "sortFields").multiple).toBe(true);
    expect(control(element, "pageSize").valueType).toBe("Number");
  });

  it("hydrates saved values and the mirrored object type", async () => {
    const element = buildEditor();
    element.inputVariables = [
      {
        name: "records",
        value: "accountList",
        valueDataType: "reference"
      },
      { name: "objectApiName", value: "Account", valueDataType: "String" },
      { name: "displayField", value: "Name", valueDataType: "String" }
    ];
    document.body.appendChild(element);
    await flushPromises();

    expect(control(element, "records").value).toBe("{!accountList}");
    expect(control(element, "displayField").value).toBe("Name");
    expect(control(element, "displayField").objectApiName).toBe("Account");
  });

  it("takes the object type from the generic mapping when no mirror is saved", async () => {
    const element = buildEditor();
    element.genericTypeMappings = [{ typeName: "T", typeValue: "Contact" }];
    element.inputVariables = [
      { name: "records", value: "accountList", valueDataType: "reference" }
    ];
    document.body.appendChild(element);
    await flushPromises();

    expect(control(element, "displayField").objectApiName).toBe("Contact");
  });

  it("moves the mapping, mirror, and dependent fields when a collection changes", async () => {
    const element = buildEditor();
    element.inputVariables = [
      { name: "records", value: "oldList", valueDataType: "reference" },
      { name: "objectApiName", value: "Contact", valueDataType: "String" },
      { name: "displayField", value: "Email", valueDataType: "String" }
    ];
    document.body.appendChild(element);
    await flushPromises();

    const mappings = jest.fn();
    const changes = jest.fn();
    element.addEventListener(
      "configuration_editor_generic_type_mapping_changed",
      mappings
    );
    element.addEventListener(
      "configuration_editor_input_value_changed",
      changes
    );

    control(element, "records").dispatchEvent(
      new CustomEvent("resourcechange", {
        detail: {
          name: "records",
          newValue: "{!accountList}",
          newValueDataType: "reference",
          resource: { objectType: "Account" }
        }
      })
    );
    await flushPromises();

    expect(mappings.mock.calls[0][0].detail).toEqual({
      typeName: "T",
      typeValue: "Account"
    });
    expect(
      changes.mock.calls.map((call) => [
        call[0].detail.name,
        call[0].detail.newValue
      ])
    ).toEqual(
      expect.arrayContaining([
        ["objectApiName", "Account"],
        ["displayField", null],
        ["sortFields", null]
      ])
    );
    expect(control(element, "displayField").objectApiName).toBe("Account");
    expect(control(element, "displayField").value).toBeNull();
  });

  it("reports required properties by label and clears them once set", async () => {
    const element = buildEditor();
    document.body.appendChild(element);
    await flushPromises();

    expect(element.validate()).toEqual([
      { key: "records", errorString: "Record Collection is required." },
      { key: "displayField", errorString: "Display Field is required." }
    ]);

    element.inputVariables = [
      { name: "records", value: "accountList", valueDataType: "reference" },
      { name: "objectApiName", value: "Account", valueDataType: "String" },
      { name: "displayField", value: "Name", valueDataType: "String" }
    ];
    await flushPromises();

    expect(element.validate()).toEqual([]);
  });

  it("shows validation errors in the panel summary", async () => {
    const element = buildEditor();
    document.body.appendChild(element);
    await flushPromises();

    element.validate();
    await flushPromises();

    const messages = Array.from(
      element.shadowRoot.querySelectorAll(".editor__errors li")
    ).map((node) => node.textContent);
    expect(messages).toEqual([
      "Record Collection is required.",
      "Display Field is required."
    ]);
  });
});
