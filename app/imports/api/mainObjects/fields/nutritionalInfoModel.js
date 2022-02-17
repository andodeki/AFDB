import { Class } from "meteor/jagi:astronomy";
import { FieldObjects } from "/imports/db/collections";
import { FieldObject } from "./fieldObjectModel";

let possibleCategories = [
  "Micronutrient",
  "Macronutrient",
  "Cooked Food",
  "Raw Ingredient",
  "Dietary Pattern",
];

const NutritionalInfoBody = Class.create({
  name: "nutritionalInfoBody",
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
          "Nutritional Info category must be one of " +
            possibleCategories.join(", ")
        );
      }
    },
  },
});

//contains specific field body schema
export const NutritionalInfo = FieldObject.inherit({
  name: "nutritionalInfo",
  collection: FieldObjects,
  fields: {
    body: NutritionalInfoBody,
  },
});
