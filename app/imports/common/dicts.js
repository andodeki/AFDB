////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                 IMPORTANT!!!
//   ALWAYS MAKE A COPY OF THESE DICTS WHEN EDITING THEM IN OTHER FILES (PREFERABLY A DEEP COPY TO BE SAFE)!
//                                             OTHERWISE IT WON'T WORK!
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { Random } from "meteor/random";
import { DeepFreeze } from "./methods";

//main object fields dict - sets what fields each main object can have
//if you're not running in test mode, you will need to reset the db to see these changes
export const mainObjectFieldsDict = DeepFreeze({
  actionableFindings: [
    "description",
    "relatedDietaryItems",
    "relatedHealthConditions",
    "link",
    "relatedSources",
    "affectedPopulation",
    "minimumDosage",
    "maximumDosage",
    "mechanismOfAction",
  ],
  debunkedMyths: ["description", "affectedPopulation"],
  dietaryItems: ["nutritionalInfo"],
  healthConditions: ["healthInfo"],
  sources: ["sourceInfo"],
  feedbacks: ["feedbackInfo"],
});

//main object fields dict - sets what fields each main object must have
export const mainObjectMandatoryFieldsDict = DeepFreeze({
  actionableFindings: [
    "description",
    "relatedDietaryItems",
    "relatedHealthConditions",
    "link",
    "relatedSources",
  ],
  debunkedMyths: ["description"],
  dietaryItems: ["nutritionalInfo"],
  healthConditions: ["healthInfo"],
  sources: ["sourceInfo"],
  feedbacks: ["feedbackInfo"],
});

//main object name dict - gives you a nicely formatted name for each main object
export const mainObjectNameDict = DeepFreeze({
  actionableFindings: "Actionable Finding",
  debunkedMyths: "Debunked Myth",
  dietaryItems: "Dietary Item",
  healthConditions: "Health Condition",
  sources: "Source",
  feedbacks: "Feedback",
});

//field object dicts

//field name dict - use this to get a nicely formatted name for a field
export const fieldNameDict = DeepFreeze({
  description: "Description",
  affectedPopulation: "Affected Population",
  minimumDosage: "Minimum Dosage",
  maximumDosage: "Maximum Dosage",
  mechanismOfAction: "Mechanism Of Action",
  nutritionalInfo: "Nutritional Information",
  relatedDietaryItems: "Related Dietary Items",
  healthInfo: "Health Information",
  relatedHealthConditions: "Related Health Conditions",
  sourceInfo: "Source Information",
  relatedSources: "Sources",
  link: "Link",
  feedbackInfo: "",
});

//new field dict - use this to initialize fields on main object create page
export const newFieldDict = DeepFreeze({
  description: { nA: false, text: "" },
  affectedPopulation: {
    nA: false,
    age: NaN,
    sex: "",
    attemptingToConceive: false,
    pregnant: false,
    nursing: false,
  },
  minimumDosage: {
    nA: false,
    amount: NaN,
    unit: "",
    frequencyTimes: NaN,
    frequencyEvery: NaN,
    frequencyPeriod: "",
    frequencyDurationNumber: NaN,
    frequencyDurationPeriod: "",
  },
  maximumDosage: {
    nA: false,
    amount: NaN,
    unit: "",
    frequencyTimes: NaN,
    frequencyEvery: NaN,
    frequencyPeriod: "",
    frequencyDurationNumber: NaN,
    frequencyDurationPeriod: "",
  },
  mechanismOfAction: { nA: false, text: "" },
  nutritionalInfo: { nA: false, category: "", details: "" },
  relatedDietaryItems: { nA: false, all: [] },
  healthInfo: { nA: false, category: "", details: "" },
  relatedHealthConditions: { nA: false, all: [] },
  sourceInfo: { nA: false, DOI: "", longTitle: "", authors: [], fileId: "" },
  relatedSources: { nA: false, all: [] },
  link: { nA: false, link: "" },
  feedbackInfo: {
    nA: false,
    subtype: "",
    targetType: "mainObject",
    targetId: "",
    targetName: "",
    text: "",
  },
});

//nA field dict - use this to send as the body of a field initialized as nA
//can't use new field dict as that leads to validation errors and has nA set as false
export const nAFieldDict = DeepFreeze({
  description: { nA: true, text: "N/A" },
  affectedPopulation: {
    nA: true,
    age: 0,
    sex: "All",
    attemptingToConceive: false,
    pregnant: false,
    nursing: false,
  },
  minimumDosage: {
    nA: true,
    amount: 0,
    unit: "grams",
    frequencyTimes: 0,
    frequencyEvery: 0,
    frequencyPeriod: "days",
    frequencyDurationNumber: 0,
    frequencyDurationPeriod: "days",
  },
  maximumDosage: {
    nA: true,
    amount: 0,
    unit: "grams",
    frequencyTimes: 0,
    frequencyEvery: 0,
    frequencyPeriod: "days",
    frequencyDurationNumber: 0,
    frequencyDurationPeriod: "days",
  },
  mechanismOfAction: { nA: true, text: "N/A" },
  nutritionalInfo: { nA: true, category: "Micronutrient", details: "N/A" },
  relatedDietaryItems: { nA: true, all: ["N/A"] },
  healthInfo: { nA: true, category: "Category 1", details: "N/A" },
  relatedHealthConditions: { nA: true, all: ["N/A"] },
  sourceInfo: {
    nA: true,
    DOI: "N/A",
    longTitle: "N/A",
    authors: ["N/A"],
    fileId: "N/A",
  },
  relatedSources: { nA: true, all: ["N/A"] },
  link: { nA: true, link: "Prevents" },
  feedbackInfo: {
    nA: true,
    subtype: "comment",
    targetType: "mainObject",
    targetId: "N/A",
    targetName: "N/A",
    text: "N/A",
  },
});

//field object dicts - use this to get a field object for testing
export const testFieldDict = DeepFreeze({
  description: { nA: false, text: "this is a test description" },
  affectedPopulation: {
    nA: false,
    age: 20,
    sex: "M",
    attemptingToConceive: false,
    pregnant: false,
    nursing: false,
  },
  minimumDosage: {
    nA: false,
    amount: 100,
    unit: "grams",
    conversions: [
      "1.00e-1 kilograms",
      "1.00e+5 milligrams",
      "1.00e+8 micrograms",
      "1.00e+14 picograms",
    ],
    frequencyTimes: 1,
    frequencyEvery: 1,
    frequencyPeriod: "days",
    frequencyDurationNumber: 1,
    frequencyDurationPeriod: "weeks",
  },
  maximumDosage: {
    nA: false,
    amount: 100,
    unit: "grams",
    conversions: [
      "1.00e-1 kilograms",
      "1.00e+5 milligrams",
      "1.00e+8 micrograms",
      "1.00e+14 picograms",
    ],
    frequencyTimes: 1,
    frequencyEvery: 1,
    frequencyPeriod: "days",
    frequencyDurationNumber: 1,
    frequencyDurationPeriod: "weeks",
  },
  mechanismOfAction: { nA: false, text: "this is a test mechanism of action" },
  nutritionalInfo: {
    nA: false,
    category: "Micronutrient",
    details: "this is a test nutritional info",
  },
  relatedDietaryItems: { nA: false, all: [Random.id()] },
  healthInfo: {
    nA: false,
    category: "Category 1",
    details: "This is a test health info",
  },
  relatedHealthConditions: { nA: false, all: [Random.id()] },
  sourceInfo: {
    nA: false,
    DOI: "123",
    longTitle: "Study 1",
    authors: ["author 1"],
    fileId: "_test1",
  },
  relatedSources: { nA: false, all: [Random.id()] },
  link: { nA: false, link: "Prevents" },
  feedbackInfo: {
    nA: false,
    subtype: "comment",
    targetType: "mainObject",
    targetId: Random.id(),
    targetName: "Actionable Finding",
    text: "this is a test feedback comment",
  },
});

//field object dicts 2 - use this to get another field object for testing
export const testFieldDict2 = DeepFreeze({
  description: { nA: false, text: "this is another test description" },
  affectedPopulation: {
    nA: false,
    age: 30,
    sex: "F",
    attemptingToConceive: false,
    pregnant: true,
    nursing: false,
  },
  minimumDosage: {
    nA: false,
    amount: 200,
    unit: "grams",
    conversions: [
      "2.00e-1 kilograms",
      "2.00e+5 milligrams",
      "2.00e+8 micrograms",
      "2.00e+14 picograms",
    ],
    frequencyTimes: 2,
    frequencyEvery: 2,
    frequencyPeriod: "days",
    frequencyDurationNumber: 2,
    frequencyDurationPeriod: "months",
  },
  maximumDosage: {
    nA: false,
    amount: 200,
    unit: "grams",
    conversions: [
      "2.00e-1 kilograms",
      "2.00e+5 milligrams",
      "2.00e+8 micrograms",
      "2.00e+14 picograms",
    ],
    frequencyTimes: 2,
    frequencyEvery: 2,
    frequencyPeriod: "days",
    frequencyDurationNumber: 2,
    frequencyDurationPeriod: "months",
  },
  mechanismOfAction: {
    nA: false,
    text: "this is another test mechanism of action",
  },
  nutritionalInfo: {
    nA: false,
    category: "Macronutrient",
    details: "this is another test nutritional info",
  },
  relatedDietaryItems: { nA: false, all: [Random.id(), Random.id()] },
  healthInfo: {
    nA: false,
    category: "Category 2",
    details: "This is another test health info",
  },
  relatedHealthConditions: { nA: false, all: [Random.id(), Random.id()] },
  sourceInfo: {
    nA: false,
    DOI: "1234",
    longTitle: "Study 2",
    authors: ["author 1", "author 2"],
    fileId: "_test2",
  },
  relatedSources: { nA: false, all: [Random.id(), Random.id()] },
  link: { nA: false, link: "Helps Manage" },
  feedbackInfo: {
    nA: false,
    subtype: "comment",
    targetType: "mainObject",
    targetId: Random.id(),
    targetName: "Actionable Finding",
    text: "this is another test feedback comment",
  },
});

//field object dicts 3 - use this to get another field object for testing
export const testFieldDict3 = DeepFreeze({
  description: { nA: false, text: "this is yet another test description" },
  affectedPopulation: {
    nA: false,
    age: 50,
    sex: "All",
    attemptingToConceive: false,
    pregnant: false,
    nursing: false,
  },
  minimumDosage: {
    nA: false,
    amount: 300,
    unit: "grams",
    conversions: [
      "3.00e-1 kilograms",
      "3.00e+5 milligrams",
      "3.00e+8 micrograms",
      "3.00e+14 picograms",
    ],
    frequencyTimes: 3,
    frequencyEvery: 3,
    frequencyPeriod: "weeks",
    frequencyDurationNumber: 3,
    frequencyDurationPeriod: "years",
  },
  maximumDosage: {
    nA: false,
    amount: 300,
    unit: "grams",
    conversions: [
      "3.00e-1 kilograms",
      "3.00e+5 milligrams",
      "3.00e+8 micrograms",
      "3.00e+14 picograms",
    ],
    frequencyTimes: 3,
    frequencyEvery: 3,
    frequencyPeriod: "weeks",
    frequencyDurationNumber: 3,
    frequencyDurationPeriod: "years",
  },
  mechanismOfAction: {
    nA: false,
    text: "this is yet another test mechanism of action",
  },
  nutritionalInfo: {
    nA: false,
    category: "Dietary Pattern",
    details: "this is yet another test nutritional info",
  },
  relatedDietaryItems: {
    nA: false,
    all: [Random.id(), Random.id(), Random.id()],
  },
  healthInfo: {
    nA: false,
    category: "Category 3",
    details: "This is yet another test health info",
  },
  relatedHealthConditions: {
    nA: false,
    all: [Random.id(), Random.id(), Random.id()],
  },
  sourceInfo: {
    nA: false,
    DOI: "12345",
    authors: ["author 1", "author 2", "author 3"],
    longTitle: "Study 3",
    fileId: "_test3",
  },
  relatedSources: { nA: false, all: [Random.id(), Random.id(), Random.id()] },
  link: { nA: false, link: "Worsens" },
  feedbackInfo: {
    nA: false,
    subtype: "comment",
    targetType: "mainObject",
    targetId: Random.id(),
    targetName: "Actionable Finding",
    text: "this is yet another test feedback comment",
  },
});
