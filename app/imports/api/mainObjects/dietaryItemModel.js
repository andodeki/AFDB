import { MainObjects } from "/imports/db/collections";
import { MainObject } from "./mainObjectModel";
import { FieldObject } from "./fields/fieldObjectModel";
import {
  mainObjectFieldsDict,
  mainObjectMandatoryFieldsDict,
} from "/imports/common/dicts";

//contains changeable fields
export const DietaryItem = MainObject.inherit({
  name: "dietaryItem",
  collection: MainObjects,
  fields: {
    syncableFields: {
      type: [String],
      default: function () {
        return mainObjectFieldsDict["dietaryItems"];
      },
    },
    mandatoryFields: {
      type: [String],
      default: function () {
        return mainObjectMandatoryFieldsDict["dietaryItems"];
      },
    },
    nutritionalInfo: {
      type: FieldObject,
      optional: true,
    },
  },
});
