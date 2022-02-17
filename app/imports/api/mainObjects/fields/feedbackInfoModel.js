import { Class } from "meteor/jagi:astronomy";
import { FieldObjects } from "/imports/db/collections";
import { FieldObject } from "./fieldObjectModel";

let possibleSubtypes = ["comment", "citation"];

let possibleTargetTypes = [
  "mainObject",
  "field",
  "subfield",
  "PDF",
  "source",
  "feedback",
];

const feedbackInfoBody = Class.create({
  name: "feedbackInfoBody",
  fields: {
    nA: {
      type: Boolean,
      default: function () {
        return false;
      },
    },
    subtype: String,
    targetType: String,
    targetId: String,
    //in the case of mainObject - say "actionable finding, or debunked myth, etc"
    //in the case of field - say field name
    //in the case of subfield - say subfield name
    targetName: String,
    targetVersion: {
      type: Number,
      optional: true,
    }, //version number of target when feedback was created - not relevant to mainObject targets
    text: String,
    availableSources: {
      type: [Object], //{sourceId: '', sourceTitle: ''}
      optional: true,
    },
    feedbackLinks: {
      type: [Object], //{sourceId: '', highlightId: '' - optional}
      optional: true,
    },
  },
  events: {
    beforeSave(e) {
      e.stopPropagation();
      let doc = e.currentTarget;

      if (!possibleSubtypes.includes(doc.subtype)) {
        throw new Meteor.Error(
          "validation-error",
          "Feedback Info Subtype must be one of " + possibleSubtypes.join(", ")
        );
      }

      if (!possibleTargetTypes.includes(doc.targetType)) {
        throw new Meteor.Error(
          "validation-error",
          "Feedback Info Target Type must be one of " +
            possibleTargetTypes.join(", ")
        );
      }

      //sanitize text to remove empty anchor tags
      // if (doc.text) {
      //   doc.text = doc.text.replace(/<[^/>][^>]*><\/[^>]+>/, "");
      // }

      //update feedbackLinks
      if (doc.text && doc.availableSources) {
        doc.feedbackLinks = [];

        doc.availableSources.forEach((sourceObject) => {
          let sourceId = sourceObject.sourceId;
          let sourceTitle = sourceObject.sourceTitle;
          let highlightMatch = doc.text.match(/\[(.*?)\]/g);
          let linkedHighlight;

          if (highlightMatch) {
            highlightMatch.forEach((match) => {
              if (match.startsWith("[highlight:")) {
                let highlightId = match
                  .substring(1, match.length - 1)
                  .replace("highlight:", "");

                if (doc.text.includes("#" + sourceTitle + match)) {
                  linkedHighlight = { sourceId, highlightId };
                  if (!doc.feedbackLinks) {
                    doc.feedbackLinks = [linkedHighlight];
                  } else if (
                    !doc.feedbackLinks.find(
                      (object) =>
                        object.sourceId === linkedHighlight.sourceId &&
                        object.highlightId === linkedHighlight.highlightId
                    )
                  ) {
                    doc.feedbackLinks.push(linkedHighlight);
                  }
                }
              }
            });
          }
        });
      }
    },
  },
});

//contains specific field body schema
export const FeedbackInfo = FieldObject.inherit({
  name: "feedbackInfo",
  collection: FieldObjects,
  fields: {
    body: feedbackInfoBody,
  },
});
