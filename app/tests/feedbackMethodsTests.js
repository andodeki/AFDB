//Tests for the client-available Meteor methods pertaining to mainObjects, but specifically focusing on Feedback mainObjects (slightly different logic)
//Includes base-cases and general edge-case testing for feedbacks

import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Random } from "meteor/random";
import { resetDatabase } from "meteor/xolvio:cleaner";
import { mockMethodCall } from "meteor/quave:testing";
import { assert } from "chai";
import { MainObject } from "/imports/api/mainObjects/mainObjectModel";
import { FieldContainer } from "/imports/api/mainObjects/fields/fieldContainerModel";
import { FieldObject } from "/imports/api/mainObjects/fields/fieldObjectModel";
import { Feedback } from "/imports/api/mainObjects/feedbackModel";
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

//helper methods

//inserts test user
const insertTestUser = () => {
  return Accounts.createUser({
    username: "test",
    password: "password",
  });
};

//inserts test main objects
//creates a feedback object with 2 versions of its feedbackInfo field
const insertFeedback = (authorId) => {
  let testFeedback = new Feedback({ title: "Test" });
  testFeedback.save();

  testFeedback.createFieldContainer("feedbackInfo");
  testFeedback.createFieldObject(
    "feedbackInfo",
    authorId,
    { ...testFieldDict["feedbackInfo"] },
    ""
  );
  testFeedback.createFieldObject("feedbackInfo", authorId, {
    ...testFieldDict2["feedbackInfo"],
  });
};

if (Meteor.isServer) {
  describe("Feedback Client-Facing Meteor Methods", function () {
    beforeEach(function () {
      resetDatabase();

      assert.equal(MainObject.find().count(), 0);
      assert.equal(FieldContainer.find().count(), 0);
      assert.equal(FieldObject.find().count(), 0);

      let testUserId = insertTestUser();

      insertFeedback(testUserId);
      assert.equal(MainObject.find().count(), 1);
    });

    describe("Feedback: mainObject.insert", function () {
      it("authorized user can insert feedback", function () {
        let feedbackCount = Feedback.find().count();
        let fieldContainerCount = FieldContainer.find().count();
        let fieldObjectCount = FieldObject.find().count();

        let id = mockMethodCall(
          "mainObject.insert",
          "feedbacks",
          "New Test Feedback",
          [
            {
              name: "feedbackInfo",
              body: { ...testFieldDict3["feedbackInfo"] },
            },
          ],
          false,
          { context: { userId } }
        );

        let newFeedback = Feedback.findOne({
          _id: id,
        });

        //check new main object exists
        assert.exists(newFeedback);

        //check fields
        assert.isTrue(
          ObjectEq(newFeedback.feedbackInfo.body, testFieldDict3.feedbackInfo)
        );

        //check correct model increments
        assert.equal(Feedback.find().count(), feedbackCount + 1);
        assert.equal(FieldContainer.find().count(), fieldContainerCount + 1);
        assert.equal(FieldObject.find().count(), fieldObjectCount + 1);
      });

      it("unauthorized user cannot insert feedback", function () {
        let feedbackCount = Feedback.find().count();
        let fieldContainerCount = FieldContainer.find().count();
        let fieldObjectCount = FieldObject.find().count();

        const fn = () =>
          mockMethodCall(
            "mainObject.insert",
            "feedbacks",
            "New Test Feedback",
            [
              {
                name: "feedbackInfo",
                body: { ...testFieldDict3["feedbackInfo"] },
              },
            ],
            false
          );
        assert.throw(fn, /Not authorized/);

        //check that there were no model increments
        assert.equal(Feedback.find().count(), feedbackCount);
        assert.equal(FieldContainer.find().count(), fieldContainerCount);
        assert.equal(FieldObject.find().count(), fieldObjectCount);
      });
    });

    describe("Feedback: mainObject.remove", function () {
      it("authorized user can remove their own feedback", function () {
        let feedbackCount = Feedback.find().count();
        let feedbackToRemove = Feedback.findOne();
        let authorId = feedbackToRemove.feedbackInfo.authorId;

        mockMethodCall("mainObject.remove", feedbackToRemove, {
          context: { userId: authorId },
        });

        //check searching for feedback returns undefined
        assert.equal(
          Feedback.findOne({ _id: feedbackToRemove._id }),
          undefined
        );

        //check correct decrementation
        assert.equal(Feedback.find().count(), feedbackCount - 1);
      });

      it("authorized user cannot remove another user's feedback", function () {
        let feedbackCount = Feedback.find().count();
        let feedbackToRemove = Feedback.findOne();

        const fn = () =>
          mockMethodCall("mainObject.remove", feedbackToRemove, {
            context: { userId },
          });
        assert.throw(fn, /Permission denied/);

        //check searching for feedback still works
        assert.notEqual(
          Feedback.findOne({ _id: feedbackToRemove._id }),
          undefined
        );

        //check no decrementation
        assert.equal(Feedback.find().count(), feedbackCount);
      });

      it("Unauthorized user cannot remove feedback", function () {
        let feedbackCount = Feedback.find().count();
        let feedbackToRemove = Feedback.findOne();

        const fn = () => mockMethodCall("mainObject.remove", feedbackToRemove);
        assert.throw(fn, /Not authorized/);

        //check searching for feedback still works
        assert.notEqual(
          Feedback.findOne({ _id: feedbackToRemove._id }),
          undefined
        );

        //check no decrementation
        assert.equal(Feedback.find().count(), feedbackCount);
      });
    });

    describe("Feedback: mainObject.update", function () {
      it("authorized user can update their own feedback", function () {
        let feedback = Feedback.findOne();
        let authorId = feedback.feedbackInfo.authorId;

        mockMethodCall(
          "mainObject.updateField",
          feedback,
          "feedbackInfo",
          { ...testFieldDict3["feedbackInfo"] },
          "test update",
          { context: { userId: authorId } }
        );
      });

      it("authorized user cannot update another user's feedback", function () {
        let feedback = Feedback.findOne();

        const fn = () =>
          mockMethodCall(
            "mainObject.updateField",
            feedback,
            "feedbackInfo",
            { ...testFieldDict3["feedbackInfo"] },
            "test update",
            { context: { userId } }
          );
        assert.throw(fn, /Permission denied/);
      });

      it("unauthorized user cannot update feedback", function () {
        let feedback = Feedback.findOne();

        const fn = () =>
          mockMethodCall(
            "mainObject.updateField",
            feedback,
            "feedbackInfo",
            { ...testFieldDict3["feedbackInfo"] },
            "test update"
          );
        assert.throw(fn, /Not authorized/);
      });
    });
  });
}
