import { MainObjects } from "/imports/db/collections";
import { MainObject } from "./mainObjectModel";
import { FieldObject } from "./fields/fieldObjectModel";
import {
  mainObjectFieldsDict,
  mainObjectMandatoryFieldsDict,
} from "/imports/common/dicts";
var Pluralize = require("pluralize");
import { DietaryItem } from "./dietaryItemModel";
import { HealthCondition } from "./healthConditionModel";

//input singular version of link, return plural
linkPluralDict = {
  Prevents: "Prevent",
  "Helps Manage": "Help Manage",
  Reverses: "Reverse",
  Causes: "Cause",
  Worsens: "Worsen",
};

let possibleLifecycles = [0, 1, 2, 3];
//where 0 corresponds to draft
//1 corresponds to in-review
//2 corresponds to submitted for go-live
//3 corresponds to live

//contains changeable fields
export const ActionableFinding = MainObject.inherit({
  name: "actionableFinding",
  collection: MainObjects,
  fields: {
    ownerId: String,
    lifecycle: Number,
    syncableFields: {
      type: [String],
      default: function () {
        return mainObjectFieldsDict["actionableFindings"];
      },
    },
    mandatoryFields: {
      type: [String],
      default: function () {
        return mainObjectMandatoryFieldsDict["actionableFindings"];
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
    minimumDosage: {
      type: FieldObject,
      optional: true,
    },
    maximumDosage: {
      type: FieldObject,
      optional: true,
    },
    mechanismOfAction: {
      type: FieldObject,
      optional: true,
    },
    relatedDietaryItems: {
      type: FieldObject,
      optional: true,
    },
    relatedHealthConditions: {
      type: FieldObject,
      optional: true,
    },
    relatedSources: {
      type: FieldObject,
      optional: true,
    },
    link: {
      type: FieldObject,
      optional: true,
    },
  },
  events: {
    beforeInsert(e) {
      e.stopPropagation();
      let doc = e.currentTarget;

      if (!possibleLifecycles.includes(doc.lifecycle)) {
        throw new Meteor.Error(
          "validation-error",
          "Lifecycle must be one of " +
            possibleLifecycles.join(", ") +
            ", got " +
            doc.lifecycle
        );
      }
    },
  },
  helpers: {
    //syncs a main object's auto-generated title
    syncTitle() {
      let formattedDietaryItems = [];
      let formattedHealthConditions = [];
      let formattedLink = "Missing Link";

      //check for dietaryItems
      if (
        this.relatedDietaryItems &&
        this.relatedDietaryItems.body.all.length > 0
      ) {
        //check for link
        if (this.link && this.link.body.link) {
          //singular dietary item case
          if (
            this.relatedDietaryItems.body.all.length == 1 &&
            Pluralize.isSingular(this.relatedDietaryItems.body.all[0])
          ) {
            formattedLink = this.link.body.link;
          }
          //plural or multiple dietary items case
          else {
            formattedLink = linkPluralDict[this.link.body.link];
          }
        }
        //format dietary items
        this.relatedDietaryItems.body.all.forEach((dietaryItemId) => {
          let object = DietaryItem.findOne({ _id: dietaryItemId });
          if (object) {
            formattedDietaryItems.push(object.title);
          }
        });
      }

      //check if formattedDietaryItems is empty and format it nicely if so
      if (formattedDietaryItems.length == 0) {
        formattedDietaryItems = ["Missing Dietary Items"];
      }

      //check for healthConditions
      if (
        this.relatedHealthConditions &&
        this.relatedHealthConditions.body.all.length > 0
      ) {
        //format health conditions
        this.relatedHealthConditions.body.all.forEach((healthConditionId) => {
          let object = HealthCondition.findOne({ _id: healthConditionId });
          if (object) {
            formattedHealthConditions.push(object.title);
          }
        });
      }

      //check if formattedHealthConditions is empty and format it nicely if so
      if (formattedHealthConditions.length == 0) {
        formattedHealthConditions = ["Missing Health Conditions"];
      }

      //format new title
      let newTitle = `${formattedDietaryItems.join(
        ", "
      )} ${formattedLink} ${formattedHealthConditions.join(", ")}`;

      //set and save new title
      this.title = newTitle;
      this.save({ fields: ["title"] });
    },
  },
});
