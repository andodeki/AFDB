//Tests for the server-only helpers pertaining to mainObjects and defined in their parent model file
//Includes base-case testing

import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Random } from "meteor/random";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { assert } from "chai";
import { MainObject } from "/imports/api/mainObjects/mainObjectModel";
import { FieldContainer } from "/imports/api/mainObjects/fields/fieldContainerModel";
import { FieldObject } from "/imports/api/mainObjects/fields/fieldObjectModel";
import { ActionableFinding } from "/imports/api/mainObjects/actionableFindingModel";
import { DebunkedMyth } from "/imports/api/mainObjects/debunkedMythModel";
import { DietaryItem } from "/imports/api/mainObjects/dietaryItemModel";
import { HealthCondition } from "/imports/api/mainObjects/healthConditionModel";
import { Source } from "/imports/api/mainObjects/sourceModel";
import { Feedback } from "/imports/api/mainObjects/feedbackModel";
import { Description } from "/imports/api/mainObjects/fields/descriptionModel";
import { AffectedPopulation } from "/imports/api/mainObjects/fields/affectedPopulationModel";
import { MinimumDosage } from "/imports/api/mainObjects/fields/minimumDosageModel";
import { MaximumDosage } from "/imports/api/mainObjects/fields/maximumDosageModel";
import { MechanismOfAction } from "/imports/api/mainObjects/fields/mechanismOfActionModel";
import { NutritionalInfo } from "/imports/api/mainObjects/fields/nutritionalInfoModel";
import { RelatedDietaryItems } from "/imports/api/mainObjects/fields/relatedDietaryItemsModel";
import { HealthInfo } from "/imports/api/mainObjects/fields/healthInfoModel";
import { RelatedHealthConditions } from "/imports/api/mainObjects/fields/relatedHealthConditionsModel";
import { SourceInfo } from "/imports/api/mainObjects/fields/sourceInfoModel";
import { RelatedSources } from "/imports/api/mainObjects/fields/relatedSourcesModel";
import { Link } from "/imports/api/mainObjects/fields/linkModel";
import { FeedbackInfo } from "/imports/api/mainObjects/fields/feedbackInfoModel";
import { ObjectEq } from "/imports/common/methods";
import {
  mainObjectFieldsDict,
  testFieldDict,
  testFieldDict2,
  testFieldDict3,
} from "/imports/common/dicts";

//random userId
const userId = Random.id();

//dicts
let objectTypeDict = {
  actionableFindings: ActionableFinding,
  debunkedMyths: DebunkedMyth,
  dietaryItems: DietaryItem,
  healthConditions: HealthCondition,
  sources: Source,
  feedbacks: Feedback,
};

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

//inserts test user
const insertTestUser = () => {
  return Accounts.createUser({
    username: "test",
    password: "password",
  });
};

//inserts test main objects
//creates 1 of each main object, each with 2 versions of each of their fields
const insertMainObjects = (authorId) => {
  for (mainObjectType in objectTypeDict) {
    let MainObject = objectTypeDict[mainObjectType];

    let testMainObject = new MainObject({ title: "Test" });
    testMainObject.save();

    mainObjectFieldsDict[mainObjectType].forEach((fieldType) => {
      testMainObject.createFieldContainer(fieldType);
      testMainObject.createFieldObject(
        fieldType,
        authorId,
        { ...testFieldDict[fieldType] },
        ""
      );
      testMainObject.createFieldObject(
        fieldType,
        authorId,
        { ...testFieldDict2[fieldType] },
        "updating this field"
      );
    });
  }
};

if (Meteor.isServer) {
  describe("Main Object Helper Methods", function () {
    beforeEach(function () {
      resetDatabase();

      assert.equal(MainObject.find().count(), 0);
      assert.equal(FieldContainer.find().count(), 0);
      assert.equal(FieldObject.find().count(), 0);

      let testUserId = insertTestUser();

      insertMainObjects(testUserId);
      assert.equal(
        MainObject.find().count(),
        Object.keys(objectTypeDict).length
      );
    });

    describe("mainObject.getFieldContainer", function () {
      it("getFieldContainer returns correct field containers for each field on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            let fieldContainer = testMainObject.getFieldContainer(fieldType);

            assert.equal(fieldContainer.fieldType, fieldType);
            assert.equal(fieldContainer.currentVersion, 2);
          });
        }
      });
    });

    describe("mainObject.setFieldVersion", function () {
      it("setFieldVersion correctly alters the version of each field container, reflecting this on their main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            testMainObject.setFieldVersion(fieldType, 1);

            assert.equal(testMainObject[fieldType].version.number, 1);
            assert.isTrue(
              ObjectEq(testMainObject[fieldType].body, testFieldDict[fieldType])
            );
          });
        }
      });
    });

    describe("mainObject.syncField", function () {
      it("syncField correctly updates each field on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            let newFieldObjectClass = fieldTypeDict[fieldType];
            let fieldContainer = testMainObject.getFieldContainer(fieldType);

            fieldContainer.currentVersion = fieldContainer.currentVersion + 1;

            fieldContainer.save();

            let newFieldObject = new newFieldObjectClass({
              fieldContainerId: fieldContainer._id,
              authorId: userId,
              version: { number: 3, isReversion: false },
              body: testFieldDict3[fieldType],
            });

            newFieldObject.save();

            testMainObject.syncField(fieldType);

            assert.isTrue(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
          });
        }
      });
    });

    describe("mainObject.syncFields", function () {
      it("syncFields correctly updates given fields on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            let newFieldObjectClass = fieldTypeDict[fieldType];
            let fieldContainer = testMainObject.getFieldContainer(fieldType);

            fieldContainer.currentVersion = fieldContainer.currentVersion + 1;

            fieldContainer.save();

            let newFieldObject = new newFieldObjectClass({
              fieldContainerId: fieldContainer._id,
              authorId: userId,
              version: { number: 3, isReversion: false },
              body: testFieldDict3[fieldType],
            });

            newFieldObject.save();
          });

          testMainObject.syncFields(testMainObject.syncableFields);

          testMainObject.syncableFields.forEach((fieldType) => {
            assert.isTrue(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
          });
        }
      });
    });

    describe("mainObject.syncAllFields", function () {
      it("syncAllFields correctly updates all syncable fields on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            let newFieldObjectClass = fieldTypeDict[fieldType];
            let fieldContainer = testMainObject.getFieldContainer(fieldType);

            fieldContainer.currentVersion = fieldContainer.currentVersion + 1;

            fieldContainer.save();

            let newFieldObject = new newFieldObjectClass({
              fieldContainerId: fieldContainer._id,
              authorId: userId,
              version: { number: 3, isReversion: false },
              body: testFieldDict3[fieldType],
            });

            newFieldObject.save();
          });

          testMainObject.syncAllFields();

          testMainObject.syncableFields.forEach((fieldType) => {
            assert.isTrue(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
          });
        }
      });
    });

    describe("mainObject.createFieldContainer", function () {
      it("createFieldContainer correctly creates new field container for each field on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let newMainObject = new currentMainObjectClass({
            title: "New " + mainObjectType,
          });

          newMainObject.save();

          mainObjectFieldsDict[mainObjectType].forEach((fieldType) => {
            newMainObject.createFieldContainer(fieldType);

            let newFieldContainer = FieldContainer.findOne({
              fieldType,
              mainObjectId: newMainObject._id,
            });

            assert.equal(newFieldContainer.fieldType, fieldType);
            assert.equal(newFieldContainer.currentVersion, 0);
          });
        }
      });
    });

    describe("mainObject.getFieldVersions", function () {
      it("getFieldVersions returns the correct number of versions for each field on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            let numVersions = testMainObject.getFieldVersions(fieldType);

            assert.equal(numVersions, 2);
          });
        }
      });
    });

    describe("mainObject.getFieldObject", function () {
      it("getFieldObject returns the correct field object for each field on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            for (let versionNum = 1; versionNum < 3; versionNum++) {
              let fieldObject = testMainObject.getFieldObject(
                fieldType,
                versionNum
              );

              if (versionNum == 1) {
                assert.isTrue(
                  ObjectEq(fieldObject.body, testFieldDict[fieldType])
                );
              } else if (versionNum == 2) {
                assert.isTrue(
                  ObjectEq(fieldObject.body, testFieldDict2[fieldType])
                );
              }
            }
          });
        }
      });
    });

    describe("mainObject.createFieldObject", function () {
      it("createFieldObject correctly creates and associates a field object for each field on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            testMainObject.createFieldObject(
              fieldType,
              userId,
              testFieldDict3[fieldType]
            );

            assert.isTrue(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
          });
        }
      });
    });

    describe("mainObject.revertFieldObject", function () {
      it("revertFieldObject correctly reverts and updates each field on main objects ", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            testMainObject.revertFieldObject(fieldType, userId, 1);

            assert.isTrue(
              ObjectEq(testMainObject[fieldType].body, testFieldDict[fieldType])
            );
          });
        }
      });
    });
  });
}
