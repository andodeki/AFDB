import { Class } from "meteor/jagi:astronomy";
import { FieldObjects } from "/imports/db/collections";
import { FieldObject } from "./fieldObjectModel";

const SourceInfoBody = Class.create({
  name: "sourceInfoBody",
  fields: {
    nA: {
      type: Boolean,
      default: function () {
        return false;
      },
    },
    DOI: String,
    longTitle: String, //actual full source title, as opposed to bibtex title on Source MainObject itself
    authors: [String],
    fileId: String,
  },
});

//contains specific field body schema
export const SourceInfo = FieldObject.inherit({
  name: "sourceInfo",
  collection: FieldObjects,
  fields: {
    body: SourceInfoBody,
  },
});
