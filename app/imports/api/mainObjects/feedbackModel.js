import { MainObjects } from "/imports/db/collections";
import { MainObject } from "./mainObjectModel";
import { FieldObject } from "./fields/fieldObjectModel";
import {
  mainObjectFieldsDict,
  mainObjectMandatoryFieldsDict,
} from "/imports/common/dicts";

//contains changeable fields
export const Feedback = MainObject.inherit({
  name: "feedback",
  collection: MainObjects,
  fields: {
    syncableFields: {
      type: [String],
      default: function () {
        return mainObjectFieldsDict["feedbacks"];
      },
    },
    mandatoryFields: {
      type: [String],
      default: function () {
        return mainObjectMandatoryFieldsDict["feedbacks"];
      },
    },
    feedbackInfo: {
      type: FieldObject,
      optional: true,
    },
  },
});
