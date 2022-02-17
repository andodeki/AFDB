import { Class } from "meteor/jagi:astronomy";
import { FieldObjects } from "/imports/db/collections";
import { FieldObject } from "./fieldObjectModel";
import { OnlyUnique } from "/imports/common/methods";

const RelatedSourcesBody = Class.create({
  name: "relatedSourcesBody",
  fields: {
    nA: {
      type: Boolean,
      default: function () {
        return false;
      },
    },
    //all related sources
    all: {
      type: [String],
    },
  },
  events: {
    beforeSave(e) {
      e.stopPropagation();
      let doc = e.currentTarget;
      let all = doc.all;

      if (all) {
        //remove duplicates
        let unique = all.filter(OnlyUnique);
        doc.all = unique;
      }
    },
  },
});

//contains specific field body schema
export const RelatedSources = FieldObject.inherit({
  name: "relatedSources",
  collection: FieldObjects,
  fields: {
    body: RelatedSourcesBody,
  },
});
