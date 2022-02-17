import { MainObjects } from "/imports/db/collections";
import { MainObject } from "./mainObjectModel";
import { FieldObject } from "./fields/fieldObjectModel";
import {
  mainObjectFieldsDict,
  mainObjectMandatoryFieldsDict,
} from "/imports/common/dicts";

//contains changeable fields
export const HealthCondition = MainObject.inherit({
  name: "healthCondition",
  collection: MainObjects,
  fields: {
    syncableFields: {
      type: [String],
      default: function () {
        return mainObjectFieldsDict["healthConditions"];
      },
    },
    mandatoryFields: {
      type: [String],
      default: function () {
        return mainObjectMandatoryFieldsDict["healthConditions"];
      },
    },
    healthInfo: {
      type: FieldObject,
      optional: true,
    },
  },
});
