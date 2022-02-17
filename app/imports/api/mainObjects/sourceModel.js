import { MainObjects } from "/imports/db/collections";
import { MainObject } from "./mainObjectModel";
import { FieldObject } from "./fields/fieldObjectModel";
import {
  mainObjectFieldsDict,
  mainObjectMandatoryFieldsDict,
} from "/imports/common/dicts";

//contains changeable fields
export const Source = MainObject.inherit({
  name: "source",
  collection: MainObjects,
  fields: {
    syncableFields: {
      type: [String],
      default: function () {
        return mainObjectFieldsDict["sources"];
      },
    },
    mandatoryFields: {
      type: [String],
      default: function () {
        return mainObjectMandatoryFieldsDict["sources"];
      },
    },
    sourceInfo: {
      type: FieldObject,
      optional: true,
    },
  },
});
