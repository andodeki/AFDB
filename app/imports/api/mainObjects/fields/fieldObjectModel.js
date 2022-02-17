import { Meteor } from "meteor/meteor";
import { Class } from "meteor/jagi:astronomy";
import { FieldObjects } from "/imports/db/collections";

const Version = Class.create({
  name: "version",
  fields: {
    number: {
      type: Number,
    },
    note: {
      type: String,
      optional: true,
    },
    isReversion: {
      type: Boolean,
    },
    reversionNumber: {
      type: Number,
      optional: true,
    },
    reversionOriginalAuthorId: {
      type: String,
      optional: true,
    },
    reversionOriginalAuthorUsername: {
      type: String,
      optional: true,
    },
  },
});

//contains parent fieldContainer Id, authorId and username, and version info
export const FieldObject = Class.create({
  name: "FieldObject",
  collection: FieldObjects,
  typeField: "type",
  //the top level fields are present for all types of fieldObjects, the structure of the nested object field depends on what type of field it is
  fields: {
    fieldContainerId: String,
    authorId: String,
    authorUsername: {
      type: String,
      optional: true,
    },
    version: Version,
  },
  behaviors: {
    timestamp: {
      hasCreatedField: true,
      createdFieldName: "createdAt",
      hasUpdatedField: true,
      updatedFieldName: "updatedAt",
    },
  },
});

if (Meteor.isServer) {
  FieldObject.extend({
    helpers: {
      // gets author username from author id and returns new field object
      syncAuthorUsername() {
        let author = Meteor.users.find({ _id: this.authorId }).fetch()[0];

        if (author) {
          this.authorUsername = author.username;
        } else {
          this.authorUsername = "[deleted user]";
        }
        this.save();

        return this;
      },

      syncReversionOriginalAuthorUsername() {
        let author = Meteor.users
          .find({ _id: this.version.reversionOriginalAuthorId })
          .fetch()[0];

        if (author) {
          this.version.reversionOriginalAuthorUsername = author.username;
        } else {
          this.version.reversionOriginalAuthorUsername = "[deleted user]";
        }
        this.save();

        return this;
      },
    },
  });
}
