import { Class } from "meteor/jagi:astronomy";
import { FieldObjects } from "/imports/db/collections";
import { FieldObject } from "./fieldObjectModel";

let possibleCategories = ["Category 1", "Category 2", "Category 3"];

const healthInfoBody = Class.create({
  name: "healthInfoBody",
  fields: {
    nA: {
      type: Boolean,
      default: function () {
        return false;
      },
    },
    category: String,
    details: String,
  },
  events: {
    beforeSave(e) {
      e.stopPropagation();
      let doc = e.currentTarget;

      if (!possibleCategories.includes(doc.category)) {
        throw new Meteor.Error(
          "validation-error",
          "Health Info category must be one of " + possibleCategories.join(", ")
        );
      }
    },
  },
});

//contains specific field body schema
export const HealthInfo = FieldObject.inherit({
  name: "healthInfo",
  collection: FieldObjects,
  fields: {
    body: healthInfoBody,
  },
});
