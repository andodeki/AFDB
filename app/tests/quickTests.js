//use this file to quickly test out anything in development
import { assert } from "chai";
import { mainObjectFieldsDict } from "/imports/common/dicts";

describe("Common Dicts", function () {
  it("testing if dicts are actually deep-frozen", function () {
    mainObjectFieldsDict.actionableFindings = "test";
    assert.notEqual(mainObjectFieldsDict.actionableFindings, "test");

    mainObjectFieldsDict.actionableFindings[0] = "test";
    assert.notEqual(mainObjectFieldsDict.actionableFindings[0], "test");
  });
});
