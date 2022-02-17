import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Highlights } from "/imports/db/collections";

Meteor.methods({
  "highlights.save"(fileId, highlights) {
    //check arg types
    check(fileId, String);
    check(highlights, Array);

    // check user has permission
    if (!this.userId) {
      throw new Meteor.Error("Not authorized");
    }

    //check if fileID is in collection, if not add new one
    let existingHighlights = Highlights.findOne({ fileId: fileId });
    if (!existingHighlights) {
      //create highlights object
      Highlights.insert({
        fileId,
        createdAt: new Date(),
      });
      //update existingHighlights
      existingHighlights = Highlights.findOne({ fileId: fileId });
    }
    //update highlights field on {fileId, highlights} object - to optimize, insert only new ones
    Highlights.update(existingHighlights._id, {
      $set: { highlights },
    });
  },

  "highlights.insert"(fileId, highlight) {
    //check arg types
    check(fileId, String);
    check(highlight, Object);

    // check user has permission
    if (!this.userId) {
      throw new Meteor.Error("Not authorized");
    }

    //check if fileID is in collection, if not add new one
    let existingHighlights = Highlights.findOne({ fileId: fileId });
    if (!existingHighlights) {
      //create highlights object
      Highlights.insert({
        fileId,
        highlights: [],
        createdAt: new Date(),
      });
      //update existingHighlights
      existingHighlights = Highlights.findOne({ fileId: fileId });
    }

    let existingHighlightsArray = existingHighlights.highlights;

    //update highlights field on {fileId, highlights} object
    Highlights.update(existingHighlights._id, {
      $set: { highlights: existingHighlightsArray.concat(highlight) },
    });

    return highlight.id;
  },
});
