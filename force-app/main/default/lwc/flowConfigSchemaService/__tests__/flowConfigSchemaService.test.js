import describeSObjectPath from "@salesforce/apex/FlowConfigApexTypeController.describeSObjectPath";
import {
  clearRecordPathCache,
  describeRecordPath
} from "c/flowConfigSchemaService";

jest.mock(
  "@salesforce/apex/FlowConfigApexTypeController.describeSObjectPath",
  () => ({ __esModule: true, default: jest.fn() }),
  { virtual: true }
);

describe("flowConfigSchemaService", () => {
  afterEach(() => {
    clearRecordPathCache();
    jest.clearAllMocks();
  });

  it("shares one normalized request across picker consumers", async () => {
    describeSObjectPath.mockResolvedValueOnce(
      JSON.stringify({
        name: "Name",
        dataType: "String",
        sourceDataType: "String"
      })
    );

    const first = describeRecordPath("Account", "Owner.Name");
    const second = describeRecordPath("Account", "Owner.Name");

    await expect(first).resolves.toMatchObject({ name: "Name" });
    await expect(second).resolves.toMatchObject({ dataType: "String" });
    expect(describeSObjectPath).toHaveBeenCalledTimes(1);
  });

  it("evicts failed requests so metadata can be retried", async () => {
    describeSObjectPath
      .mockRejectedValueOnce(new Error("temporary failure"))
      .mockResolvedValueOnce(
        JSON.stringify({ name: "Name", dataType: "String" })
      );

    await expect(describeRecordPath("Contact", "Name")).rejects.toThrow(
      "temporary failure"
    );
    await expect(describeRecordPath("Contact", "Name")).resolves.toMatchObject({
      name: "Name"
    });
    expect(describeSObjectPath).toHaveBeenCalledTimes(2);
  });
});
