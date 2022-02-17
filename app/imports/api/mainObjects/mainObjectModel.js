import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Class } from "meteor/jagi:astronomy";
import { softremove } from "meteor/jagi:astronomy-softremove-behavior";
import { MainObjects } from "/imports/db/collections";
import { FieldContainer } from "./fields/fieldContainerModel";
import { FieldObject } from "./fields/fieldObjectModel";
import { Description } from "./fields/descriptionModel";
import { AffectedPopulation } from "./fields/affectedPopulationModel";
import { MinimumDosage } from "./fields/minimumDosageModel";
import { MaximumDosage } from "./fields/maximumDosageModel";
import { MechanismOfAction } from "./fields/mechanismOfActionModel";
import { NutritionalInfo } from "./fields/nutritionalInfoModel";
import { RelatedDietaryItems } from "./fields/relatedDietaryItemsModel";
import { HealthInfo } from "./fields/healthInfoModel";
import { RelatedHealthConditions } from "./fields/relatedHealthConditionsModel";
import { SourceInfo } from "./fields/sourceInfoModel";
import { RelatedSources } from "./fields/relatedSourcesModel";
import { Link } from "./fields/linkModel";
import { FeedbackInfo } from "./fields/feedbackInfoModel";
import { checkKeys } from "/imports/common/methods";
import { newFieldDict } from "/imports/common/dicts";

let fieldTypeDict = {
  description: Description,
  affectedPopulation: AffectedPopulation,
  minimumDosage: MinimumDosage,
  maximumDosage: MaximumDosage,
  mechanismOfAction: MechanismOfAction,
  nutritionalInfo: NutritionalInfo,
  relatedDietaryItems: RelatedDietaryItems,
  healthInfo: HealthInfo,
  relatedHealthConditions: RelatedHealthConditions,
  sourceInfo: SourceInfo,
  relatedSources: RelatedSources,
  link: Link,
  feedbackInfo: FeedbackInfo,
};

//contains title (static)
export const MainObject = Class.create({
  name: "MainObject",
  collection: MainObjects,
  typeField: "type",
  fields: {
    title: String,
    titleCounter: {
      type: Number,
      default: function () {
        return 1; //initialize title counter at 1
      },
    },
    //display title field is calculated on beforeInsert
    displayTitle: {
      type: String,
      optional: true,
    },
  },
  events: {
    //set titleCounter and get display title based on title and titleCounter
    beforeSave(e) {
      // let doc = e.target;
      // doc.syncTitle();
      //   let mainObjectModelName = doc.type;
      //   //title logic
      //   //get saved main objects of same type
      //   let existingMainObjects = MainObject.find(
      //     {
      //       type: mainObjectModelName,
      //     },
      //     { disableEvents: true }
      //   )
      //     .fetch()
      //     .filter((mainObject) => !mainObject._isNew);
      //   //filter for mainObjects with same title
      //   let sameTitles = existingMainObjects.filter(
      //     (mainObject) => mainObject.title == doc.title
      //   );
      //   //if we have mainObjects with the same title, filter for the highest title counter
      //   if (sameTitles.length > 0) {
      //     let maxCounter = sameTitles.reduce((max, current) =>
      //       max.titleCounter > current.titleCounter ? max : current
      //     ).titleCounter;
      //     //increment current actionable finding title counter
      //     doc.titleCounter = maxCounter + 1;
      //   }
      //   let title = doc.title;
      //   let titleCounter = doc.titleCounter;
      //   if (title && titleCounter) {
      //     if (titleCounter != 1) {
      //       e.target.displayTitle = title + " " + titleCounter;
      //     } else {
      //       e.target.displayTitle = title;
      //     }
      //   } else {
      //     throw new Meteor.Error("Error creating title and/or titleCounter");
      //   }
    },
  },
  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: "createdAt",
      hasUpdatedField: true,
      updatedFieldName: "updatedAt",
    },
    softremove: {
      // The field name with a flag for marking a document as removed.
      removedFieldName: "removed",
      // A flag indicating if a "removedAt" field should be present in a document.
      hasRemovedAtField: true,
      // The field name storing the removal date.
      removedAtFieldName: "removedAt",
    },
  },
});

//server-side helpers
if (Meteor.isServer) {
  MainObject.extend({
    helpers: {
      // returns specified field container associated with current actionable finding
      getFieldContainer(fieldType) {
        check(fieldType, String);

        return FieldContainer.findOne({
          fieldType,
          mainObjectId: this._id,
        });
      },

      // sets current version of specified fieldContainer
      setFieldVersion(fieldType, number) {
        check(fieldType, String);
        check(number, Number);

        let fieldContainer = this.getFieldContainer(fieldType);
        fieldContainer.currentVersion = number;
        fieldContainer.save();

        this.syncField(fieldType);
      },

      syncTitle() {
        //implemented in child classes
      },

      // syncs a specific field to the actionable finding by checking a field's current version and saving it as an MainObject attribute,
      syncField(fieldType) {
        check(fieldType, String);

        let currentVersion = this.getFieldContainer(fieldType).currentVersion;
        let fieldObject = this.getFieldObject(fieldType, currentVersion);

        this[fieldObject.type] = fieldObject;
        this.save({ fields: [fieldType] }, (error, result) => {
          if (error) {
            throw new Meteor.Error(
              "save-error",
              "error saving new field onto main object",
              error
            );
          } else if (result) {
            //on successful save, check if just-updated field is used in display title generation, and if so, update that too
            if (
              fieldType == "relatedDietaryItems" ||
              "relatedHealthConditions" ||
              "link"
            ) {
              this.syncTitle();
            }
          }
        });
      },

      // syncs fields in given array of field fieldTypes
      syncFields(fieldTypes) {
        check(fieldTypes, Array);
        fieldTypes.forEach((fieldType) => this.syncField(fieldType));
      },

      // syncs all syncable field fieldTypes for actionable finding
      syncAllFields() {
        this.syncFields(this.syncableFields);
      },

      createFieldContainer(fieldType) {
        check(fieldType, String);

        newFieldContainer = new FieldContainer({
          fieldType,
          mainObjectId: this._id,
        });

        newFieldContainer.save(function (error, id) {
          if (error) {
            throw error; //forward error to caller
          }
        });
      },

      //returns the number of different fieldObject versions for a given field
      getFieldVersions(fieldType) {
        check(fieldType, String);

        //get all field objects associated to a field container
        let fieldObjects = FieldObject.find({
          type: fieldType,
          fieldContainerId: this.getFieldContainer(fieldType)._id,
        });

        return fieldObjects.count();
      },

      // returns specified field object corresponding to given version number
      getFieldObject(fieldType, versionNumber) {
        check(fieldType, String);
        check(versionNumber, Number);

        let numVersions = this.getFieldVersions(fieldType);

        if (versionNumber > numVersions || versionNumber <= 0) {
          throw new Meteor.Error(
            "invalid-version-number",
            "given version number is outside of range, there are " +
              numVersions +
              " available versions"
          );
        }

        let fieldObject = FieldObject.findOne({
          type: fieldType,
          fieldContainerId: this.getFieldContainer(fieldType)._id,
          "version.number": versionNumber,
        });

        if (fieldObject) {
          fieldObject = fieldObject.syncAuthorUsername();

          if (fieldObject.version.isReversion) {
            fieldObject = fieldObject.syncReversionOriginalAuthorUsername();
          }
        } else {
          throw new Meteor.Error("no-field-object", "no field object found");
        }

        return fieldObject;
      },

      //creates new field object and updates version in relevant field container
      //can also create reversions when called from revertField method
      createFieldObject(
        fieldType,
        authorId,
        body,
        note,
        isReversion = false,
        reversionNumber,
        reversionOriginalAuthorId
      ) {
        check(fieldType, String);
        check(authorId, String);
        checkKeys(body, newFieldDict[fieldType]);
        if (note) {
          check(note, String);
        }
        check(isReversion, Boolean);
        if (isReversion) {
          check(reversionNumber, Number);
          check(reversionOriginalAuthorId, String);
        }

        let fieldContainer = this.getFieldContainer(fieldType);

        if (!fieldContainer) {
          throw new Meteor.Error(
            "no-field-container",
            "field container for " + fieldType + "not found on " + this.type
          );
        }

        let type = fieldTypeDict[fieldType];

        newFieldObject = new type({
          fieldContainerId: fieldContainer._id,
          authorId,
          version: {
            number: fieldContainer.currentVersion + 1,
            note,
            isReversion,
            reversionNumber,
            reversionOriginalAuthorId,
          },
          body,
        });

        const setNewVersion = () => {
          this.setFieldVersion(fieldType, fieldContainer.currentVersion + 1);
        };

        newFieldObject.save(function (error, id) {
          if (!error) {
            //set new version if all went well when saving
            setNewVersion();
          } else {
            throw error; //forward error to caller
          }
        });
      },

      //reverts field to previous version by creating new version with body of old version
      revertFieldObject(fieldType, authorId, versionNumber, note) {
        let reversionField = this.getFieldObject(fieldType, versionNumber);

        //if reverting to a reversion, revert to original version instead
        if (reversionField.version.isReversion) {
          console.log(
            "info: ",
            "trying to revert to a reversion, reverting to original version instead"
          );
          reversionField = this.getFieldObject(
            fieldType,
            reversionField.version.reversionNumber
          );
        }

        //check that current version is not the same as reversion version
        let currentField = this[fieldType];

        if (currentField.version.number == reversionField.version.number) {
          throw new Meteor.Error("Can't revert to current version");
        }

        //check that current version is not already a reversion to the given version
        if (
          currentField.version.isReversion &&
          currentField.version.reversionNumber == reversionField.version.number
        ) {
          throw new Meteor.Error("Can't revert back to same version");
        }

        this.createFieldObject(
          fieldType,
          authorId,
          reversionField.body,
          note,
          true,
          reversionField.version.number,
          reversionField.authorId
        );
      },
    },
  });
}
