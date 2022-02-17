import { Class } from "meteor/jagi:astronomy";
import { FieldObjects } from "/imports/db/collections";
import { FieldObject } from "./fieldObjectModel";
import { OnlyUnique } from "/imports/common/methods";

const RelatedDietaryItemsBody = Class.create({
  name: "relatedDietaryItemsBody",
  fields: {
    nA: {
      type: Boolean,
      default: function () {
        return false;
      },
    },
    //all related dietary items
    all: {
      type: [String],
    },
  },
    events: {
    beforeSave(e) {
      e.stopPropagation();
      let doc = e.currentTarget;
      let all = doc.all;

      if(all){
        //remove duplicates
        let unique = all.filter(OnlyUnique);
        doc.all = unique;
      }
    },
  }
});

//contains specific field body schema
export const RelatedDietaryItems = FieldObject.inherit({
  name: "relatedDietaryItems",
  collection: FieldObjects,
  fields: {
    body: RelatedDietaryItemsBody,
  },
});
