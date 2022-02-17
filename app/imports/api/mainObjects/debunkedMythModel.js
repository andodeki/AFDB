import { MainObjects } from "/imports/db/collections";
import { MainObject } from "./mainObjectModel";
import { FieldObject } from "./fields/fieldObjectModel";
import {
  mainObjectFieldsDict,
  mainObjectMandatoryFieldsDict,
} from "/imports/common/dicts";

//contains changeable fields
export const DebunkedMyth = MainObject.inherit({
  name: "debunkedMyth",
  collection: MainObjects,
  fields: {
    //all possible fields this object can have
    syncableFields: {
      type: [String],
      default: function () {
        return mainObjectFieldsDict["debunkedMyths"];
      },
    },
    mandatoryFields: {
      type: [String],
      default: function () {
        return mainObjectMandatoryFieldsDict["debunkedMyths"];
      },
    },
    description: {
      type: FieldObject,
      optional: true,
    },
    affectedPopulation: {
      type: FieldObject,
      optional: true,
    },
  },
});
