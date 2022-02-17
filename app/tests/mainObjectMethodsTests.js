//Tests for the client-available Meteor methods pertaining to mainObjects
//Includes base-case and general edge-case testing for main objects

import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Random } from "meteor/random";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { mockMethodCall } from "meteor/quave:testing";
import { assert } from "chai";
import { MainObject } from "/imports/api/mainObjects/mainObjectModel";
import { FieldContainer } from "/imports/api/mainObjects/fields/fieldContainerModel";
import { FieldObject } from "/imports/api/mainObjects/fields/fieldObjectModel";
import { ActionableFinding } from "/imports/api/mainObjects/actionableFindingModel";
import { DebunkedMyth } from "/imports/api/mainObjects/debunkedMythModel";
import { DietaryItem } from "/imports/api/mainObjects/dietaryItemModel";
import { HealthCondition } from "/imports/api/mainObjects/healthConditionModel";
import { Source } from "/imports/api/mainObjects/sourceModel";
// import { Feedback } from "/imports/api/mainObjects/feedbackModel";
import { ObjectEq } from "/imports/common/methods";
import {
  mainObjectFieldsDict,
  mainObjectMandatoryFieldsDict,
  testFieldDict,
  testFieldDict2,
  testFieldDict3,
  newFieldDict,
} from "/imports/common/dicts";

//random userId
const userId = Random.id();

//dict
let objectTypeDict = {
  actionableFindings: ActionableFinding,
  debunkedMyths: DebunkedMyth,
  dietaryItems: DietaryItem,
  healthConditions: HealthCondition,
  sources: Source,
  // feedbacks: Feedback,
};

//helper methods

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

    testMainObject.syncableFields.forEach((fieldType) => {
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
  describe("Main Object Client-Facing Meteor Methods", function () {
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

    describe("mainObject.insert", function () {
      it("authorized user can insert all main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let currentMainObjectClassCount = currentMainObjectClass
            .find()
            .count();
          let fieldContainerCount = FieldContainer.find().count();
          let fieldObjectCount = FieldObject.find().count();

          let fieldCount = 0;
          let fieldObjectsArray = [];

          mainObjectFieldsDict[mainObjectType].forEach((fieldType) => {
            fieldObjectsArray.push({
              name: fieldType,
              body: { ...testFieldDict3[fieldType] },
            });
            fieldCount++;
          });

          let id = mockMethodCall(
            "mainObject.insert",
            mainObjectType,
            "New Test Main Object",
            fieldObjectsArray,
            false,
            { context: { userId } }
          );

          let newMainObject = currentMainObjectClass.findOne({
            _id: id,
          });

          //check new main object exists
          assert.exists(newMainObject);

          //check fields
          newMainObject.syncableFields.forEach((fieldType) => {
            assert.isTrue(
              ObjectEq(newMainObject[fieldType].body, testFieldDict3[fieldType])
            );
          });

          //check correct model increments
          assert.equal(
            currentMainObjectClass.find().count(),
            currentMainObjectClassCount + 1
          );
          assert.equal(
            FieldContainer.find().count(),
            fieldContainerCount + fieldCount
          );
          assert.equal(
            FieldObject.find().count(),
            fieldObjectCount + fieldCount
          );
        }
      });

      it("unauthorized user cannot insert any main object", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);
          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let currentMainObjectClassCount = currentMainObjectClass
            .find()
            .count();
          let fieldContainerCount = FieldContainer.find().count();
          let fieldObjectCount = FieldObject.find().count();

          let fieldObjectsArray = [];

          mainObjectFieldsDict[mainObjectType].forEach((fieldType) => {
            fieldObjectsArray.push({
              name: fieldType,
              body: { ...testFieldDict3[fieldType] },
            });
          });

          const fn = () =>
            mockMethodCall(
              "mainObject.insert",
              mainObjectType,
              "New Test Main Object",
              fieldObjectsArray,
              false
            );
          assert.throw(fn, /Not authorized/);

          //check that there were no model increments
          assert.equal(
            currentMainObjectClass.find().count(),
            currentMainObjectClassCount
          );
          assert.equal(FieldContainer.find().count(), fieldContainerCount);
          assert.equal(FieldObject.find().count(), fieldObjectCount);
        }
      });

      it("failed insertion of main object removes created main object as well as associated field containers and field objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);
          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let currentMainObjectClassCount = currentMainObjectClass
            .find()
            .count();
          let fieldContainerCount = FieldContainer.find().count();
          let fieldObjectCount = FieldObject.find().count();

          let fieldObjectsArray = [];

          mainObjectFieldsDict[mainObjectType].forEach((fieldType) => {
            fieldObjectsArray.push({
              name: fieldType,
              body: { ...testFieldDict3[fieldType] },
            });
          });

          const fn = () =>
            mockMethodCall(
              "mainObject.insert",
              mainObjectType,
              "New Test Main Object",
              fieldObjectsArray,
              true,
              { context: { userId } }
            );
          assert.throw(fn, /test-failure/);

          //check that there were no model increments
          assert.equal(
            currentMainObjectClass.find().count(),
            currentMainObjectClassCount
          );
          assert.equal(FieldContainer.find().count(), fieldContainerCount);
          assert.equal(FieldObject.find().count(), fieldObjectCount);
        }
      });

      it("trying to insert main objects with invalid field throws invalid field error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let currentMainObjectClassCount = currentMainObjectClass
            .find()
            .count();
          let fieldContainerCount = FieldContainer.find().count();
          let fieldObjectCount = FieldObject.find().count();

          let fieldObjectsArray = [];

          mainObjectFieldsDict[mainObjectType].forEach((fieldType) => {
            fieldObjectsArray.push({
              name: fieldType,
              body: { ...testFieldDict3[fieldType] },
            });
          });

          fieldObjectsArray.push({
            name: "invalidFieldName",
            body: { text: "test" },
          });

          const fn = () =>
            mockMethodCall(
              "mainObject.insert",
              mainObjectType,
              "New Test Main Object",
              fieldObjectsArray,
              false,
              { context: { userId } }
            );
          assert.throw(fn, /invalid-field/);

          //check that there were no model increments
          assert.equal(
            currentMainObjectClass.find().count(),
            currentMainObjectClassCount
          );
          assert.equal(FieldContainer.find().count(), fieldContainerCount);
          assert.equal(FieldObject.find().count(), fieldObjectCount);
        }
      });

      it("trying to insert main objects with mandatory fields set as N/A throws missing mandatory field error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let currentMainObjectClassCount = currentMainObjectClass
            .find()
            .count();
          let fieldContainerCount = FieldContainer.find().count();
          let fieldObjectCount = FieldObject.find().count();

          let fieldObjectsArray = [];

          mainObjectFieldsDict[mainObjectType].forEach((fieldType) => {
            fieldObjectsArray.push({
              name: fieldType,
              body: { ...testFieldDict3[fieldType] },
            });
          });

          fieldObjectsArray.forEach((fieldObject) => {
            if (
              mainObjectMandatoryFieldsDict[mainObjectType].includes(
                fieldObject.name
              )
            ) {
              fieldObject.body.nA = true;
            }
          });

          const fn = () =>
            mockMethodCall(
              "mainObject.insert",
              mainObjectType,
              "New Test Main Object",
              fieldObjectsArray,
              false,
              { context: { userId } }
            );
          assert.throw(fn, /missing-mandatory-field/);

          //check that there were no model increments
          assert.equal(
            currentMainObjectClass.find().count(),
            currentMainObjectClassCount
          );
          assert.equal(FieldContainer.find().count(), fieldContainerCount);
          assert.equal(FieldObject.find().count(), fieldObjectCount);
        }
      });

      it("trying to insert main objects with empty field objects throws empty subfield error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let currentMainObjectClassCount = currentMainObjectClass
            .find()
            .count();
          let fieldContainerCount = FieldContainer.find().count();
          let fieldObjectCount = FieldObject.find().count();

          let fieldObjectsArray = [];

          mainObjectFieldsDict[mainObjectType].forEach((fieldType) => {
            fieldObjectsArray.push({
              name: fieldType,
              body: {},
            });
          });

          const fn = () =>
            mockMethodCall(
              "mainObject.insert",
              mainObjectType,
              "New Test Main Object",
              fieldObjectsArray,
              false,
              { context: { userId } }
            );
          assert.throw(fn, "empty-subfield");

          //check that there were no model increments
          assert.equal(
            currentMainObjectClass.find().count(),
            currentMainObjectClassCount
          );
          assert.equal(FieldContainer.find().count(), fieldContainerCount);
          assert.equal(FieldObject.find().count(), fieldObjectCount);
        }
      });

      it("trying to insert main objects with wrongly formatted field objects throws validation error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let currentMainObjectClassCount = currentMainObjectClass
            .find()
            .count();
          let fieldContainerCount = FieldContainer.find().count();
          let fieldObjectCount = FieldObject.find().count();

          let fieldObjectsArray = [];

          mainObjectFieldsDict[mainObjectType].forEach((fieldType) => {
            fieldObjectsArray.push({
              name: fieldType,
              body: { wrongFormat: true },
            });
          });

          const fn = () =>
            mockMethodCall(
              "mainObject.insert",
              mainObjectType,
              "New Test Main Object",
              fieldObjectsArray,
              false,
              { context: { userId } }
            );
          assert.throw(fn, "validation-error");

          //check that there were no model increments
          assert.equal(
            currentMainObjectClass.find().count(),
            currentMainObjectClassCount
          );
          assert.equal(FieldContainer.find().count(), fieldContainerCount);
          assert.equal(FieldObject.find().count(), fieldObjectCount);
        }
      });

      it("trying to insert main objects with empty field object subfields throws empty subfield error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let currentMainObjectClassCount = currentMainObjectClass
            .find()
            .count();
          let fieldContainerCount = FieldContainer.find().count();
          let fieldObjectCount = FieldObject.find().count();

          let fieldObjectsArray = [];

          mainObjectFieldsDict[mainObjectType].forEach((fieldType) => {
            fieldObjectsArray.push({
              name: fieldType,
              body: { ...newFieldDict[fieldType] },
            });
          });

          const fn = () =>
            mockMethodCall(
              "mainObject.insert",
              mainObjectType,
              "New Test Main Object",
              fieldObjectsArray,
              false,
              { context: { userId } }
            );
          assert.throw(fn, "empty-subfield");

          //check that there were no model increments
          assert.equal(
            currentMainObjectClass.find().count(),
            currentMainObjectClassCount
          );
          assert.equal(FieldContainer.find().count(), fieldContainerCount);
          assert.equal(FieldObject.find().count(), fieldObjectCount);
        }
      });

      it("trying to insert main objects with wrong type of field object subfields throws match error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let currentMainObjectClassCount = currentMainObjectClass
            .find()
            .count();
          let fieldContainerCount = FieldContainer.find().count();
          let fieldObjectCount = FieldObject.find().count();

          let fieldObjectsArray = [];

          mainObjectFieldsDict[mainObjectType].forEach((fieldType) => {
            fieldObjectsArray.push({
              name: fieldType,
              body: { ...testFieldDict3[fieldType] },
            });
          });

          fieldObjectsArray.forEach((fieldObject) => {
            for (subfield in fieldObject.body) {
              fieldObject.body[subfield] = Boolean(subfield);
            }
          });

          const fn = () =>
            mockMethodCall(
              "mainObject.insert",
              mainObjectType,
              "New Test Main Object",
              fieldObjectsArray,
              false,
              { context: { userId } }
            );
          assert.throw(fn, /Match error/);

          //check that there were no model increments
          assert.equal(
            currentMainObjectClass.find().count(),
            currentMainObjectClassCount
          );
          assert.equal(FieldContainer.find().count(), fieldContainerCount);
          assert.equal(FieldObject.find().count(), fieldObjectCount);
        }
      });
    });

    describe("mainObject.remove", function () {
      it("authorized user can remove Actionable Findings, Debunked Myths, and Feedbacks, but not other main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          if (
            mainObjectType == "actionableFindings" ||
            mainObjectType == "debunkedMyths"
          ) {
            let currentMainObjectClass = objectTypeDict[mainObjectType];
            let currentMainObjectClassCount = currentMainObjectClass
              .find()
              .count();

            let objectToRemove = currentMainObjectClass.findOne();
            let objectToRemoveTitle = objectToRemove.title;

            mockMethodCall("mainObject.remove", objectToRemove, {
              context: { userId },
            });

            //check searching for object returns undefined
            assert.equal(
              currentMainObjectClass.findOne({ title: objectToRemoveTitle }),
              undefined
            );

            //check correct decrementation of main object class instances
            assert.equal(
              currentMainObjectClass.find().count(),
              currentMainObjectClassCount - 1
            );
          } else {
            let currentMainObjectClass = objectTypeDict[mainObjectType];
            let currentMainObjectClassCount = currentMainObjectClass
              .find()
              .count();

            let objectToRemove = currentMainObjectClass.findOne();
            let objectToRemoveTitle = objectToRemove.title;

            const fn = () =>
              mockMethodCall("mainObject.remove", objectToRemove, {
                context: { userId },
              });
            assert.throw(fn, /wrong-type-error/);

            //check searching for object still works
            assert.equal(
              currentMainObjectClass.findOne({ title: objectToRemoveTitle })
                .title,
              objectToRemoveTitle
            );

            //check no decrementation of main object class instances
            assert.equal(
              currentMainObjectClass.find().count(),
              currentMainObjectClassCount
            );
          }
        }
      });

      it("unauthorized user cannot remove any main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          if (
            mainObjectType == "actionableFindings" ||
            mainObjectType == "debunkedMyths"
          ) {
            let currentMainObjectClass = objectTypeDict[mainObjectType];
            let currentMainObjectClassCount = currentMainObjectClass
              .find()
              .count();

            let objectToRemove = currentMainObjectClass.findOne();
            let objectToRemoveTitle = objectToRemove.title;

            const fn = () =>
              mockMethodCall("mainObject.remove", objectToRemove, {});

            assert.throw(fn, /Not authorized/);

            //check searching for object still works
            assert.equal(
              currentMainObjectClass.findOne({ title: objectToRemoveTitle })
                .title,
              objectToRemoveTitle
            );

            //check no decrementation of main object class instances
            assert.equal(
              currentMainObjectClass.find().count(),
              currentMainObjectClassCount
            );
          } else {
            let currentMainObjectClass = objectTypeDict[mainObjectType];
            let currentMainObjectClassCount = currentMainObjectClass
              .find()
              .count();

            let objectToRemove = currentMainObjectClass.findOne();
            let objectToRemoveTitle = objectToRemove.title;

            const fn = () =>
              mockMethodCall("mainObject.remove", objectToRemove, {});
            assert.throw(fn, /Not authorized/);

            //check searching for object still works
            assert.equal(
              currentMainObjectClass.findOne({ title: objectToRemoveTitle })
                .title,
              objectToRemoveTitle
            );

            //check no decrementation of main object class instances
            assert.equal(
              currentMainObjectClass.find().count(),
              currentMainObjectClassCount
            );
          }
        }
      });
    });

    describe("mainObject.getFieldVersions", function () {
      it("authorized user can get number of versions of each field on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();
          testMainObject.syncableFields.forEach((fieldType) => {
            const fn = mockMethodCall(
              "mainObject.getFieldVersions",
              testMainObject,
              fieldType,
              { context: { userId } }
            );
            assert.equal(fn, 2);
          });
        }
      });

      it("unauthorized user cannot get number of versions of any field on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            const fn = () =>
              mockMethodCall(
                "mainObject.getFieldVersions",
                testMainObject,
                fieldType
              );

            assert.throw(fn, /Not authorized/);
          });
        }
      });
    });

    describe("mainObject.getFieldObject", function () {
      it("authorized user can get all versions of all field objects on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            for (let versionNumber = 1; versionNumber < 3; versionNumber++) {
              const fn = mockMethodCall(
                "mainObject.getFieldObject",
                testMainObject,
                fieldType,
                versionNumber,
                { context: { userId } }
              );

              if (versionNumber == 1) {
                assert.isTrue(ObjectEq(fn.body, testFieldDict[fieldType]));
              } else if (versionNumber == 2) {
                assert.isTrue(ObjectEq(fn.body, testFieldDict2[fieldType]));
              }
            }
          });
        }
      });

      it("unauthorized user cannot get any field objects on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();
          testMainObject.syncableFields.forEach((fieldType) => {
            const fn = () =>
              mockMethodCall(
                "mainObject.getFieldObject",
                testMainObject,
                fieldType,
                1
              );
            assert.throw(fn, /Not authorized/);
          });
        }
      });

      it("trying to get field object on main objects with invalid version number throws invalid version number error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            //0th version test
            const fn = () => {
              let returnValue = mockMethodCall(
                "mainObject.getFieldObject",
                testMainObject,
                fieldType,
                0,
                { context: { userId } }
              );
              assert.equal(returnValue, undefined);
            };

            assert.throw(fn, /invalid-version-number/);

            //n+1th version test
            const fn2 = () => {
              let returnValue = mockMethodCall(
                "mainObject.getFieldObject",
                testMainObject,
                fieldType,
                3,
                { context: { userId } }
              );

              assert.equal(returnValue, undefined);
            };

            assert.throw(fn2, /invalid-version-number/);
          });
        }
      });
    });

    describe("mainObject.updateField", function () {
      it("authorized user can update all fields on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            mockMethodCall(
              "mainObject.updateField",
              testMainObject,
              fieldType,
              { ...testFieldDict3[fieldType] },
              "test update",
              { context: { userId } }
            );

            //check that edit went through
            assert.isTrue(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
            assert.equal(testMainObject[fieldType].version.note, "test update");
          });
        }
      });

      it("unauthorized user cannot update any fields on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            const fn = () =>
              mockMethodCall(
                "mainObject.updateField",
                testMainObject,
                fieldType,
                { ...testFieldDict3[fieldType] },
                "test update"
              );
            assert.throw(fn, /Not authorized/);

            //check that edit did not go through
            assert.isFalse(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
            assert.notEqual(
              testMainObject[fieldType].version.note,
              "test update"
            );
          });
        }
      });

      it("trying to update invalid field on main objects throws invalid field error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();
          let testMainObjectCopy = { ...testMainObject };

          const fn = () =>
            mockMethodCall(
              "mainObject.updateField",
              testMainObject,
              "invalidFieldName",
              { text: "test" },
              "test update",
              { context: { userId } }
            );
          assert.throw(fn, "invalid-field");

          //updated main object - not necessary due to var being a memory reference, but included for clarity
          let newTestMainObject = currentMainObjectClass.findOne();

          //check that edit did not go through
          assert.isTrue(ObjectEq(newTestMainObject, testMainObjectCopy));
        }
      });

      it("trying to update main object mandatory fields as N/A throws missing mandatory field error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.mandatoryFields.forEach((fieldType) => {
            let nABody = { ...testMainObject[fieldType].body };
            nABody.nA = true;

            const fn = () =>
              mockMethodCall(
                "mainObject.updateField",
                testMainObject,
                fieldType,
                nABody,
                "test update",
                { context: { userId } }
              );
            assert.throw(fn, /missing-mandatory-field/);

            //check that edit did not go through
            assert.isFalse(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
            assert.notEqual(
              testMainObject[fieldType].version.note,
              "test update"
            );
          });
        }
      });

      it("trying to update main object fields with empty field object throws empty subfield error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            const fn = () =>
              mockMethodCall(
                "mainObject.updateField",
                testMainObject,
                fieldType,
                {},
                "test update",
                { context: { userId } }
              );
            assert.throw(fn, "empty-subfield");

            //check that edit did not go through
            assert.isFalse(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
            assert.notEqual(
              testMainObject[fieldType].version.note,
              "test update"
            );
          });
        }
      });

      it("trying to update main object fields with wrongly formatted field object throws validation error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            const fn = () =>
              mockMethodCall(
                "mainObject.updateField",
                testMainObject,
                fieldType,
                { test: "test" },
                "test update",
                { context: { userId } }
              );
            assert.throw(fn, /validation-error/);

            //check that edit did not go through
            assert.isFalse(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
            assert.notEqual(
              testMainObject[fieldType].version.note,
              "test update"
            );
          });
        }
      });

      it("trying to update main object fields with empty field object subfield throws empty subfield error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            const fn = () =>
              mockMethodCall(
                "mainObject.updateField",
                testMainObject,
                fieldType,
                newFieldDict[fieldType],
                "test update",
                { context: { userId } }
              );
            assert.throw(fn, /empty-subfield/);

            //check that edit did not go through
            assert.isFalse(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
            assert.notEqual(
              testMainObject[fieldType].version.note,
              "test update"
            );
          });
        }
      });

      it("trying to update main object fields with wrong type of subfields throws match error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            let body = { ...newFieldDict[fieldType] };
            for (subfield in body) {
              body[subfield] = Boolean(body[subfield]);
            }

            const fn = () =>
              mockMethodCall(
                "mainObject.updateField",
                testMainObject,
                fieldType,
                body,
                "test update",
                { context: { userId } }
              );
            assert.throw(fn, /Match error/);

            //check that edit did not go through
            assert.isFalse(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
            assert.notEqual(
              testMainObject[fieldType].version.note,
              "test update"
            );
          });
        }
      });
    });

    describe("mainObject.revertField", function () {
      it("authorized user can revert all fields on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            mockMethodCall(
              "mainObject.revertField",
              testMainObject,
              fieldType,
              1,
              "test reversion",
              { context: { userId } }
            );

            //check that edit went through
            assert.isTrue(
              ObjectEq(testMainObject[fieldType].body, testFieldDict[fieldType])
            );
            assert.equal(testMainObject[fieldType].version.reversionNumber, 1);
            assert.equal(
              testMainObject[fieldType].version.note,
              "test reversion"
            );
          });
        }
      });

      it("unauthorized user cannot revert any fields on main objects", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            const fn = () =>
              mockMethodCall(
                "mainObject.revertField",
                testMainObject,
                fieldType,
                1,
                "test reversion"
              );

            assert.throw(fn, /Not authorized/);

            //check that edit did not go through
            assert.isFalse(
              ObjectEq(testMainObject[fieldType].body, testFieldDict[fieldType])
            );

            assert.notEqual(
              testMainObject[fieldType].version.note,
              "test reversion"
            );
          });
        }
      });

      it("trying to revert invalid field on main objects throws invalid field error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();
          let testMainObjectCopy = { ...testMainObject };

          const fn = () =>
            mockMethodCall(
              "mainObject.revertField",
              testMainObject,
              "invalidFieldName",
              1,
              "test reversion",
              { context: { userId } }
            );
          assert.throw(fn, /invalid-field/);

          //update main object - not necessary due to var being a memory reference, but included for clarity
          let newTestMainObject = currentMainObjectClass.findOne();

          //check that reversion did not go through
          assert.isTrue(ObjectEq(testMainObjectCopy, newTestMainObject));
        }
      });

      it("trying to revert fields on main objects to invalid version number throws invalid version number error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            //0th version test
            const fn = () =>
              mockMethodCall(
                "mainObject.revertField",
                testMainObject,
                fieldType,
                0,
                "test reversion",
                { context: { userId } }
              );
            assert.throw(fn, /invalid-version-number/);

            //check that reversion did not go through
            assert.isFalse(
              ObjectEq(testMainObject[fieldType].body, testFieldDict[fieldType])
            );

            assert.notEqual(
              testMainObject[fieldType].version.note,
              "test reversion"
            );

            //n+1th version test
            const fn2 = () =>
              mockMethodCall(
                "mainObject.revertField",
                testMainObject,
                fieldType,
                3,
                "test reversion",
                { context: { userId } }
              );
            assert.throw(fn2, /invalid-version-number/);

            //check that reversion did not go through
            assert.isFalse(
              ObjectEq(testMainObject[fieldType].body, testFieldDict[fieldType])
            );

            assert.notEqual(
              testMainObject[fieldType].version.note,
              "test reversion"
            );
          });
        }
      });

      it("trying to revert fields on main objects to the same version as the current version throws the correct error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            const fn = () =>
              mockMethodCall(
                "mainObject.revertField",
                testMainObject,
                fieldType,
                2,
                "test reversion",
                { context: { userId } }
              );

            assert.throw(fn, /Can't revert to current version/);

            //check that edit did not go through
            assert.isFalse(
              ObjectEq(testMainObject[fieldType].body, testFieldDict[fieldType])
            );

            assert.notEqual(
              testMainObject[fieldType].version.note,
              "test reversion"
            );
          });
        }
      });

      it("trying to revert fields on main objects to the same version as the current version's reversion version throws the correct error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            //revert to version 1
            mockMethodCall(
              "mainObject.revertField",
              testMainObject,
              fieldType,
              1,
              "test reversion",
              { context: { userId } }
            );

            //check reversion went through
            assert.isTrue(
              ObjectEq(testMainObject[fieldType].body, testFieldDict[fieldType])
            );
            assert.equal(testMainObject[fieldType].version.reversionNumber, 1);
            assert.equal(
              testMainObject[fieldType].version.note,
              "test reversion"
            );

            //try to revert to version 1 again
            const fn = () =>
              mockMethodCall(
                "mainObject.revertField",
                testMainObject,
                fieldType,
                1,
                "another test reversion",
                { context: { userId } }
              );

            assert.throw(fn, /Can't revert back to same version/);

            //check that second reversion did not go through
            assert.equal(
              testMainObject[fieldType].version.number,
              3 //if it had gone through this would be 4
            );

            assert.notEqual(
              testMainObject[fieldType].version.note,
              "another test reversion"
            );
          });
        }
      });

      it("trying to revert fields on main objects to another reversion will instead revert to the original version", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            //revert to version 1 (creating version 3)
            mockMethodCall(
              "mainObject.revertField",
              testMainObject,
              fieldType,
              1,
              "test reversion",
              { context: { userId } }
            );

            //check reversion went through
            assert.isTrue(
              ObjectEq(testMainObject[fieldType].body, testFieldDict[fieldType])
            );
            assert.equal(testMainObject[fieldType].version.reversionNumber, 1);
            assert.equal(
              testMainObject[fieldType].version.note,
              "test reversion"
            );

            //create new version (version 4)
            mockMethodCall(
              "mainObject.updateField",
              testMainObject,
              fieldType,
              testFieldDict3[fieldType],
              "test update",
              { context: { userId } }
            );

            //check update went through
            assert.isTrue(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
            assert.equal(testMainObject[fieldType].version.number, 4);
            assert.equal(testMainObject[fieldType].version.note, "test update");

            //try to revert to version 3 (which is a reversion to version 1)
            mockMethodCall(
              "mainObject.revertField",
              testMainObject,
              fieldType,
              3,
              "another test reversion",
              { context: { userId } }
            );

            //check that latest reversion went through and reverted back to version 1
            assert.equal(testMainObject[fieldType].version.number, 5);

            assert.isTrue(
              ObjectEq(testMainObject[fieldType].body, testFieldDict[fieldType])
            );

            assert.equal(
              testMainObject[fieldType].version.note,
              "another test reversion"
            );

            assert.equal(testMainObject[fieldType].version.reversionNumber, 1);
          });
        }
      });

      it("trying to revert fields on main objects to another reversion whose original version is the same version as the current version's reversion version throws the correct error", function () {
        for (mainObjectType in objectTypeDict) {
          console.log("Testing ", mainObjectType);

          let currentMainObjectClass = objectTypeDict[mainObjectType];
          let testMainObject = currentMainObjectClass.findOne();

          testMainObject.syncableFields.forEach((fieldType) => {
            //steps:
            //1. revert to version 1 (version 3)
            //2. create new version
            //3. create reversion straight to version 1
            //4. try to revert to first reversion to version 1 (version 3)
            // On reverting to version 3, it should try to revert to version 1 instead and it
            // will throw an error because the current version is already a reversion to version 1

            //revert to version 1 (creating version 3)
            mockMethodCall(
              "mainObject.revertField",
              testMainObject,
              fieldType,
              1,
              "test reversion",
              { context: { userId } }
            );

            //check reversion went through
            assert.isTrue(
              ObjectEq(testMainObject[fieldType].body, testFieldDict[fieldType])
            );
            assert.equal(testMainObject[fieldType].version.reversionNumber, 1);
            assert.equal(
              testMainObject[fieldType].version.note,
              "test reversion"
            );

            //create new version (version 4)
            mockMethodCall(
              "mainObject.updateField",
              testMainObject,
              fieldType,
              testFieldDict3[fieldType],
              "test update",
              { context: { userId } }
            );

            //check update went through
            assert.isTrue(
              ObjectEq(
                testMainObject[fieldType].body,
                testFieldDict3[fieldType]
              )
            );
            assert.equal(testMainObject[fieldType].version.number, 4);
            assert.equal(testMainObject[fieldType].version.note, "test update");

            //revert to version 1 (creating version 5)
            mockMethodCall(
              "mainObject.revertField",
              testMainObject,
              fieldType,
              1,
              "test reversion",
              { context: { userId } }
            );

            //check that reversion went through
            assert.equal(testMainObject[fieldType].version.number, 5);

            assert.isTrue(
              ObjectEq(testMainObject[fieldType].body, testFieldDict[fieldType])
            );

            assert.equal(
              testMainObject[fieldType].version.note,
              "test reversion"
            );

            assert.equal(testMainObject[fieldType].version.reversionNumber, 1);

            //try to revert to version 3 (which is a reversion to version 1)
            const fn = () =>
              mockMethodCall(
                "mainObject.revertField",
                testMainObject,
                fieldType,
                3,
                "another test reversion",
                { context: { userId } }
              );

            assert.throw(fn, /Can't revert back to same version/);

            //check that second reversion did not go through
            assert.equal(
              testMainObject[fieldType].version.number,
              5 //if it had gone through this would be 6
            );

            assert.notEqual(
              testMainObject[fieldType].version.note,
              "another test reversion"
            );
          });
        }
      });
    });
  });
}
