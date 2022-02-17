import "./routines";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { ActionableFinding } from "/imports/api/mainObjects/actionableFindingModel";
import { DebunkedMyth } from "/imports/api/mainObjects/debunkedMythModel";
import { DietaryItem } from "/imports/api/mainObjects/dietaryItemModel";
import { HealthCondition } from "/imports/api/mainObjects/healthConditionModel";
import { Source } from "/imports/api/mainObjects/sourceModel";
import { Highlights } from "/imports/db/collections";
import { Feedback } from "/imports/api/mainObjects/feedbackModel";
import "/imports/api/publications";
import "/imports/api/users/userMethods.js";
import "/imports/api/mainObjects/mainObjectMethods";
import "/imports/common/dicts";
import {
  mainObjectNameDict,
  testFieldDict,
  testFieldDict2,
  testFieldDict3,
} from "/imports/common/dicts";
import "./fileHandling";
import "/imports/api/highlightsMethods";
import { resetDatabase } from "meteor/xolvio:cleaner";
import "/imports/db/collections";

let objectTypeDict = {
  actionableFindings: ActionableFinding,
  debunkedMyths: DebunkedMyth,
  dietaryItems: DietaryItem,
  healthConditions: HealthCondition,
  sources: Source,
  feedbacks: Feedback,
};

let seedingData = true; //seed data?
let resetDB = true; //reset DB on server reload?

const SEED_USERNAME_1 = "dev";
const SEED_PASSWORD_1 = "password";

const SEED_USERNAME_2 = "dev2";
const SEED_PASSWORD_2 = "password";

Meteor.startup(() => {
  // code to run on server at startup

  if (resetDB) {
    //reset database
    resetDatabase();
  }

  //insert users
  if (!Accounts.findUserByUsername(SEED_USERNAME_1)) {
    console.log("seeding users...");
    Accounts.createUser({
      username: SEED_USERNAME_1,
      password: SEED_PASSWORD_1,
    });
  }

  if (!Accounts.findUserByUsername(SEED_USERNAME_2)) {
    Accounts.createUser({
      username: SEED_USERNAME_2,
      password: SEED_PASSWORD_2,
    });
  }

  let user1 = Accounts.findUserByUsername(SEED_USERNAME_1);
  let user2 = Accounts.findUserByUsername(SEED_USERNAME_2);

  if (seedingData && ActionableFinding.find().count() == 0) {
    console.log("seeding data...");

    let hl1 = Highlights.insert({ fileId: "_test2", highlights: [] });

    //insert one of each main object
    for (mainObjectType in objectTypeDict) {
      let MainObject = objectTypeDict[mainObjectType];

      let newMainObject = new MainObject({
        title: "First " + mainObjectNameDict[mainObjectType],
      });

      if (mainObjectType === "actionableFindings") {
        newMainObject.ownerId = user1._id;
        newMainObject.lifecycle = 1;
      }

      newMainObject.save();

      newMainObject.syncableFields.forEach((fieldType) => {
        newMainObject.createFieldContainer(fieldType);
        newMainObject.createFieldObject(
          fieldType,
          user1._id,
          testFieldDict[fieldType],
          ""
        );
        newMainObject.createFieldObject(
          fieldType,
          user2._id,
          testFieldDict2[fieldType],
          "updating this field"
        );
      });
    }

    //link actual dietary item to actionable finding
    let a1 = ActionableFinding.findOne();
    let d1 = DietaryItem.findOne();

    a1.createFieldObject(
      "relatedDietaryItems",
      user2._id,
      { nA: false, all: [d1._id] },
      "updating this field again"
    );

    //link actual health condition to actionable finding
    let h1 = HealthCondition.findOne();

    a1.createFieldObject(
      "relatedHealthConditions",
      user2._id,
      { nA: false, all: [h1._id] },
      "updating this field again"
    );

    //create an additional source and link both to actionable finding
    let newSource = new Source({
      title: "Second Source",
    });
    newSource.save();

    newSource.syncableFields.forEach((fieldType) => {
      newSource.createFieldContainer(fieldType);
      newSource.createFieldObject(
        fieldType,
        user1._id,
        testFieldDict3[fieldType],
        ""
      );
    });

    let s1 = Source.find().fetch()[0];
    let s2 = Source.find().fetch()[1];

    a1.createFieldObject(
      "relatedSources",
      user2._id,
      { nA: false, all: [s1._id, s2._id] },
      "updating this field again"
    );

    //link feedback to actual actionable finding
    let f1 = Feedback.findOne();
    f1.createFieldObject("feedbackInfo", user1._id, {
      nA: false,
      subtype: "comment",
      targetType: "mainObject",
      targetId: a1._id,
      targetName: "Actionable Finding",
      text: "test comment",
    });

    let f2 = new Feedback({ title: "Feedback" });
    f2.save();
    f2.createFieldContainer("feedbackInfo");
    f2.createFieldObject("feedbackInfo", user2._id, {
      nA: false,
      subtype: "comment",
      targetType: "mainObject",
      targetId: a1._id,
      targetName: "Actionable Finding",
      text: "test comment 2",
    });

    let f3 = new Feedback({ title: "Feedback" });
    f3.save();
    f3.createFieldContainer("feedbackInfo");
    f3.createFieldObject("feedbackInfo", user2._id, {
      nA: false,
      subtype: "comment",
      targetType: "field",
      targetId: a1._id,
      targetName: "description",
      targetVersion: 2,
      text: "test comment on description",
    });
  }
});
