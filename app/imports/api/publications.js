import { Meteor } from "meteor/meteor";
import { MainObject } from "./mainObjects/mainObjectModel";
import { ActionableFinding } from "./mainObjects/actionableFindingModel";
import { DebunkedMyth } from "./mainObjects/debunkedMythModel";
import { DietaryItem } from "./mainObjects/dietaryItemModel";
import { HealthCondition } from "./mainObjects/healthConditionModel";
import { Source } from "./mainObjects/sourceModel";
import { Highlights } from "/imports/db/collections";
import { Feedback } from "./mainObjects/feedbackModel";

if (Meteor.isServer) {
  //check for user
  if (Meteor.userId) {
    // Meteor.publish("mainObjects", function () {
    //   return MainObject.find({});
    // });
    Meteor.publish("actionableFindings", function () {
      return ActionableFinding.find({ lifecycle: { $ne: 0 } });
    });
    Meteor.publish("debunkedMyths", function () {
      return DebunkedMyth.find({});
    });
    Meteor.publish("dietaryItems", function () {
      return DietaryItem.find({});
    });
    Meteor.publish("healthConditions", function () {
      return HealthCondition.find({});
    });
    Meteor.publish("sources", function () {
      return Source.find({});
    });
    Meteor.publish("highlights", function () {
      return Highlights.find({});
    });
    Meteor.publish("feedbacks", function () {
      return Feedback.find({});
    });
  }
}
