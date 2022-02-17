import { Class } from "meteor/jagi:astronomy";
import { FieldObjects } from "/imports/db/collections";
import { FieldObject } from "./fieldObjectModel";

let possibleLinks = [
  "Prevents",
  "Helps Manage",
  "Reverses",
  "Causes",
  "Worsens",
];

const LinkBody = Class.create({
  name: "linkBody",
  fields: {
    nA: {
      type: Boolean,
      default: function () {
        return false;
      },
    },
    link: String,
  },
  events: {
    beforeSave(e) {
      e.stopPropagation();
      let doc = e.currentTarget;

      if (!possibleLinks.includes(doc.link)) {
        throw new Meteor.Error(
          "validation-error",
          "Link must be one of " + possibleLinks.join(", ")
        );
      }
    },
  },
});

//contains specific field body schema
export const Link = FieldObject.inherit({
  name: "link",
  collection: FieldObjects,
  fields: {
    body: LinkBody,
  },
});
