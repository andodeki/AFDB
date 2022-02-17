import { Class } from "meteor/jagi:astronomy";
import { FieldObjects } from "/imports/db/collections";
import { FieldObject } from "./fieldObjectModel";

const DescriptionBody = Class.create({
  name: "descriptionBody",
  fields: {
    nA: {
      type: Boolean,
      default: function () {
        return false;
      },
    },
    text: {
      type: String,
    },
  },
});

//contains specific field body schema
export const Description = FieldObject.inherit({
  name: "description",
  collection: FieldObjects,
  fields: {
    body: DescriptionBody,
  },
});
