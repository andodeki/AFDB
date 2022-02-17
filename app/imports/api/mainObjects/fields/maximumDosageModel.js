import { Class } from "meteor/jagi:astronomy";
import { FieldObjects } from "/imports/db/collections";
import { FieldObject } from "./fieldObjectModel";

let possibleUnits = [
  "kilograms",
  "grams",
  "milligrams",
  "micrograms",
  "picograms",
  "cubic centimeters",
  "fluid ounces",
  "cups",
  "cubic centimeters",
  "fluid ounces",
  "cups",
  "moles",
  "millimoles",
  "micromoles",
];

possiblePeriods = ["days", "weeks", "months", "years"];

const MaximumDosageBody = Class.create({
  name: "maximumDosageBody",
  fields: {
    nA: {
      type: Boolean,
      default: function () {
        return false;
      },
    },
    amount: {
      type: Number,
    },
    unit: {
      type: String,
    },
    //these are transient and will be calculated at every save, but to keep general tests working, they are being set as "optional"
    conversions: {
      type: [String],
      optional: true,
    },

    //frequency format:
    //{frequencyTimes} times every {frequencyEvery} {frequencyPeriod} for {frequencyDuratioNNumber} {FrequencyDurationPeriod}
    //example: 3 times every 2 days for 3 months
    frequencyTimes: {
      type: Number,
    },
    frequencyEvery: {
      type: Number,
    },
    frequencyPeriod: {
      type: String,
    },
    frequencyDurationNumber: {
      type: Number,
    },
    frequencyDurationPeriod: {
      type: String,
    },
  },
  events: {
    beforeSave(e) {
      e.stopPropagation();
      let doc = e.currentTarget;
      let unit = doc.unit;
      let frequencyPeriod = doc.frequencyPeriod;
      let frequencyDurationPeriod = doc.frequencyDurationPeriod;

      //check unit validity
      if (!unit || !possibleUnits.includes(unit)) {
        throw new Meteor.Error(
          "validation-error",
          "Maximum Dosage unit must be one of " + possibleUnits.join(", ")
        );
      }

      //check frequency period validity
      if (!frequencyPeriod || !possiblePeriods.includes(frequencyPeriod)) {
        throw new Meteor.Error(
          "validation-error",
          "Maximum Dosage frequency period must be one of " +
            possiblePeriods.join(", ")
        );
      }

      //check frequency duration period validity
      if (
        !frequencyDurationPeriod ||
        !possiblePeriods.includes(frequencyDurationPeriod)
      ) {
        throw new Meteor.Error(
          "validation-error",
          "Maximum Dosage frequency duration period must be one of " +
            possiblePeriods.join(", ")
        );
      }

      //calculate conversions and round amount
      let amount = doc.amount;
      let conversions = [];

      //calculating mass conversions
      if (unit == "kilograms") {
        conversions.push((amount * 1000).toExponential(2) + " grams");
        conversions.push((amount * 1000000).toExponential(2) + " milligrams");
        conversions.push(
          (amount * 1000000000).toExponential(2) + " micrograms"
        );
        conversions.push(
          (amount * 1000000000000000).toExponential(2) + " picograms"
        );
      } else if (unit == "grams") {
        conversions.push((amount * 0.001).toExponential(2) + " kilograms");
        conversions.push((amount * 1000).toExponential(2) + " milligrams");
        conversions.push((amount * 1000000).toExponential(2) + " micrograms");
        conversions.push(
          (amount * 1000000000000).toExponential(2) + " picograms"
        );
      } else if (unit == "milligrams") {
        conversions.push((amount * 0.000001).toExponential(2) + " kilograms");
        conversions.push((amount * 0.001).toExponential(2) + " grams");
        conversions.push((amount * 1000).toExponential(2) + " micrograms");
        conversions.push((amount * 1000000000).toExponential(2) + " picograms");
      } else if (unit == "micrograms") {
        conversions.push(
          (amount * 0.000000001).toExponential(2) + " kilograms"
        );
        conversions.push((amount * 0.000001).toExponential(2) + " grams");
        conversions.push((amount * 0.001).toExponential(2) + " milligrams");
        conversions.push((amount * 1000000).toExponential(2) + " picograms");
      } else if (unit == "picograms") {
        conversions.push(
          (amount * 0.000000000000001).toExponential(2) + " kilograms"
        );
        conversions.push((amount * 0.000000000001).toExponential(2) + " grams");
        conversions.push(
          (amount * 0.000000001).toExponential(2) + " milligrams"
        );
        conversions.push((amount * 0.000001).toExponential(2) + " micrograms");
      } else if (unit == "cubic centimeters") {
        //calculating volume conversions
        conversions.push((amount * 0.00422675).toExponential(2) + " cups");
        conversions.push(
          (amount * 0.033814).toExponential(2) + " fluid ounces"
        );
      } else if (unit == "fluid ounces") {
        conversions.push((amount * 0.125).toExponential(2) + " cups");
        conversions.push(
          (amount * 29.5735).toExponential(2) + " cubic centimeters"
        );
      } else if (unit == "cups") {
        conversions.push((amount * 8).toExponential(2) + " fluid ounces");
        conversions.push(
          (amount * 236.588).toExponential(2) + " cubic centimeters"
        );
      } else if (unit == "moles") {
        conversions.push((amount * 1000).toExponential(2) + "millimoles");
        conversions.push((amount * 1000000).toExponential(2) + "micromoles");
      } else if (unit == "millimoles") {
        conversions.push((amount * 0.001).toExponential(2) + "moles");
        conversions.push((amount * 1000).toExponential(2) + " micromoles");
      } else if (unit == "micromoles") {
        conversions.push((amount * 0.000001).toExponential(2) + " moles");
        conversions.push((amount * 0.001).toExponential(2) + " millimoles");
      }
      //pushing conversions onto document
      doc.conversions = conversions;
    },
  },
});

//contains specific field body schema
export const MaximumDosage = FieldObject.inherit({
  name: "maximumDosage",
  collection: FieldObjects,
  fields: {
    body: MaximumDosageBody,
  },
});
