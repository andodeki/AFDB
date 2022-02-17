import { Class } from "meteor/jagi:astronomy";
import { FieldObjects } from "/imports/db/collections";
import { FieldObject } from "./fieldObjectModel";

let possibleSexes = ["All", "M", "F"];

const AffectedPopulationBody = Class.create({
  name: "affectedPopulationBody",
  fields: {
    nA: {
      type: Boolean,
      default: function () {
        return false;
      },
    },
    age: Number,
    sex: String,
    attemptingToConceive: Boolean,
    pregnant: Boolean,
    nursing: Boolean,
  },
  events: {
    beforeInsert(e) {
      e.stopPropagation();
      let doc = e.currentTarget;

      if (!possibleSexes.includes(doc.sex)) {
        throw new Meteor.Error(
          "validation-error",
          "Sex must be one of " + possibleSexes.join(", ")
        );
      }
    },
  },
});

//contains specific field body schema
export const AffectedPopulation = FieldObject.inherit({
  name: "affectedPopulation",
  collection: FieldObjects,
  fields: {
    body: AffectedPopulationBody,
  },
});
