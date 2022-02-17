import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { ActionableFinding } from "./actionableFindingModel";
import { DebunkedMyth } from "./debunkedMythModel";
import { DietaryItem } from "./dietaryItemModel";
import { HealthCondition } from "./healthConditionModel";
import { Source } from "./sourceModel";
import { Feedback } from "./feedbackModel";
import {
  mainObjectFieldsDict,
  mainObjectMandatoryFieldsDict,
} from "/imports/common/dicts";
import { ObjectHasEmptyField } from "/imports/common/methods";
import { removeFile } from "/server/fileHandling";

let objectTypeDict = {
  actionableFindings: ActionableFinding,
  debunkedMyths: DebunkedMyth,
  dietaryItems: DietaryItem,
  healthConditions: HealthCondition,
  sources: Source,
  feedbacks: Feedback,
};

Meteor.methods({
  //inserts a new main object with associated given field objects
  //returns new main object id for routing
  //if error, deletes all created field containers, field objects, and main object
  "mainObject.insert"(
    mainObjectType,
    title,
    fieldNameBodyPairs,
    testFailure = false
  ) {
    check(mainObjectType, String);
    check(title, String);
    check(fieldNameBodyPairs, Array);

    let MainObject = objectTypeDict[mainObjectType];

    // check user is authorized
    if (!this.userId) {
      throw new Meteor.Error("Not authorized");
    }

    let mainObject = new MainObject({ title });

    //save new main object and create all other objects associated with it
    try {
      mainObject.save(function (error, id) {
        if (error) {
          throw error;
        }
      });

      fieldNameBodyPairs.forEach((fieldNameBodyPair) => {
        //check field being inserted is allowed
        if (
          mainObjectFieldsDict[mainObjectType].includes(
            fieldNameBodyPair["name"]
          )
        ) {
          //check field being inserted has no empty subfields
          let emptyField = ObjectHasEmptyField(fieldNameBodyPair["body"]);

          if (!emptyField || mainObjectType === "feedbacks") {
            mainObject.createFieldContainer(fieldNameBodyPair["name"]);
            mainObject.createFieldObject(
              fieldNameBodyPair["name"],
              this.userId,
              fieldNameBodyPair["body"],
              ""
            );
          } else {
            throw new Meteor.Error(
              "empty-subfield",
              "field object " +
                fieldNameBodyPair["name"] +
                " has empty subfield: " +
                emptyField
            );
          }
        } else {
          throw new Meteor.Error(
            "invalid-field",
            "Tried to insert with invalid field" + fieldNameBodyPair["name"]
          );
        }
      });

      //check that object has all fields before proceeding
      mainObjectFieldsDict[mainObjectType].forEach((fieldType) => {
        //check field exists
        if (!mainObject[fieldType]) {
          throw new Meteor.Error(
            "missing-field",
            "Field missing: " + fieldType
          );
        }

        //check field is not mandatory and marked as nA
        if (
          !mainObject[fieldType] ||
          (mainObjectMandatoryFieldsDict[mainObjectType].includes(fieldType) &&
            mainObject[fieldType].body.nA)
        ) {
          throw new Meteor.Error(
            "missing-mandatory-field",
            "Mandatory field marked as N/A: " + fieldType
          );
        }
      });

      if (testFailure) {
        throw new Meteor.Error(
          "test-failure",
          "testing failure",
          "check that main object as well as associated field containers and field objects were removed"
        );
      }

      //if all went well, return main object id back to caller
      return mainObject._id;
    } catch (error) {
      //if something went wrong, remove mainObject and associated objects, then throw error
      mainObject.syncableFields.forEach((fieldType) => {
        let fieldContainer = mainObject.getFieldContainer(fieldType);
        if (fieldContainer) {
          //field container present, first remove its objects, then remove it
          //if fieldContainer version is non-zero, it has associated fieldObjects
          if (fieldContainer.currentVersion != 0) {
            for (
              var versionNumber = 1;
              versionNumber <= fieldContainer.currentVersion;
              versionNumber++
            ) {
              let fieldObject = mainObject.getFieldObject(
                fieldType,
                versionNumber
              );
              if (fieldObject) {
                fieldObject.remove();
              }
            }
          }
          fieldContainer.remove();
        }
      });
      //remove main object
      mainObject.remove();

      //if main object is source, remove file
      if (Meteor.isServer) {
        removeFile(fieldNameBodyPairs[0].body.fileId);
      }
      throw error; //forward error to client
    }
  },

  //soft removes main object (remains in db)
  //returns nothing
  //currently only allowed on Actionable Findings and Debunked Myths
  "mainObject.remove"(mainObject) {
    //check user is authorized
    if (!this.userId) {
      throw new Meteor.Error("Not authorized");
    }

    //if main object is of type feedback, check user is author of feedback object
    if (
      mainObject.type === "feedback" &&
      mainObject.feedbackInfo.authorId !== this.userId
    ) {
      throw new Meteor.Error("Permission denied");
    }

    //check mainObject type
    if (
      !(
        mainObject.type === "actionableFinding" ||
        mainObject.type === "debunkedMyth" ||
        mainObject.type === "feedback"
      )
    ) {
      throw new Meteor.Error(
        "wrong-type-error",
        "mainObject must be of type Actionable Finding, Debunked Myth, or Feedback, got " +
          mainObject.type
      );
    }

    if (Meteor.isServer) {
      mainObject.softRemove();
    }
  },

  //gets a specific field object corresponding to the given fieldType and version number
  //returns said field object
  "mainObject.getFieldObject"(mainObject, fieldType, versionNumber) {
    //check user is authorized
    if (!this.userId) {
      throw new Meteor.Error("Not authorized");
    }

    //check mainObject type
    if (!Object.keys(objectTypeDict).includes(mainObject.type + "s")) {
      throw new Meteor.Error(
        "wrong-type-error",
        "mainObject must be of type MainObject"
      );
    }

    if (Meteor.isServer) {
      return mainObject.getFieldObject(fieldType, versionNumber);
    }
  },

  //finds the number of versions of a specific fieldType
  //returns this number
  "mainObject.getFieldVersions"(mainObject, fieldType) {
    //check user is authorized
    if (!this.userId) {
      throw new Meteor.Error("Not authorized");
    }

    //check mainObject type
    if (!Object.keys(objectTypeDict).includes(mainObject.type + "s")) {
      throw new Meteor.Error(
        "wrong-type-error",
        "mainObject must be of type MainObject"
      );
    }

    if (Meteor.isServer) {
      return mainObject.getFieldVersions(fieldType);
    }
  },

  //updates a field object on a main object to a new version
  //returns nothing
  "mainObject.updateField"(mainObject, fieldType, body, note) {
    //check user is authorized
    if (!this.userId) {
      throw new Meteor.Error("Not authorized");
    }

    //if main object is of type feedback, check user is author of feedback object
    if (
      mainObject.type === "feedback" &&
      mainObject.feedbackInfo.authorId !== this.userId
    ) {
      //debugging
      throw new Meteor.Error("Permission denied");
    }

    //check mainObject type
    if (!Object.keys(objectTypeDict).includes(mainObject.type + "s")) {
      throw new Meteor.Error(
        "wrong-type-error",
        "mainObject must be of type MainObject"
      );
    }

    if (Meteor.isServer) {
      //check field being updated is allowed
      if (mainObject.syncableFields.includes(fieldType)) {
        //check field being updated is not mandatory and marked as nA
        if (mainObject.mandatoryFields.includes(fieldType) && body.nA) {
          throw new Meteor.Error(
            "missing-mandatory-field",
            "Mandatory field marked as N/A: " + fieldType
          );
        }

        //check field being inserted has no empty subfields
        let emptyField = ObjectHasEmptyField(body);

        if (!emptyField || fieldType === "feedbackInfo") {
          mainObject.createFieldObject(fieldType, this.userId, body, note);
        } else {
          throw new Meteor.Error(
            "empty-subfield",
            "field object " + fieldType + " has empty subfield: " + emptyField
          );
        }
      } else {
        throw new Meteor.Error(
          "invalid-field",
          "Tried to update invalid field" + fieldType
        );
      }
    }
  },

  //reverts a field object on a main object to an older version corresponding to the given versionNumber
  //returns nothing
  "mainObject.revertField"(mainObject, fieldType, versionNumber, note) {
    //check user is authorized
    if (!this.userId) {
      throw new Meteor.Error("Not authorized");
    }
    //check mainObject type
    if (!Object.keys(objectTypeDict).includes(mainObject.type + "s")) {
      throw new Meteor.Error(
        "wrong-type-error",
        "mainObject must be of type MainObject"
      );
    }

    if (Meteor.isServer) {
      if (mainObject.syncableFields.includes(fieldType)) {
        mainObject.revertFieldObject(
          fieldType,
          this.userId,
          versionNumber,
          note
        );
      } else {
        throw new Meteor.Error(
          "invalid-field",
          "Tried to revert invalid field" + fieldType
        );
      }
    }
  },
});
