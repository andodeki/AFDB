import { Class } from "meteor/jagi:astronomy";
import { FieldContainers } from "/imports/db/collections";

//contains container type, parent actionable finding id, and current version number
export const FieldContainer = Class.create({
  name: "FieldContainer",
  collection: FieldContainers,
  fields: {
    fieldType: String,
    mainObjectId: String,
    currentVersion: {
      type: Number,
      default: function () {
        return 0; //initializes as empty container, so version is 0
      },
    },
  },
  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: "createdAt",
      hasUpdatedField: true,
      updatedFieldName: "updatedAt",
    },
  },
});
