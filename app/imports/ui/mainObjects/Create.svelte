<script>
  import { router } from "tinro";
  import { Session } from "meteor/session";
  import { ObjectHasEmptyField } from "/imports/common/methods";
  import {
    mainObjectFieldsDict,
    mainObjectMandatoryFieldsDict,
    newFieldDict,
    nAFieldDict,
    mainObjectNameDict,
  } from "/imports/common/dicts";
  import _ from "lodash";
  import DescriptionCreate from "./fields/description/Create";
  import AffectedPopulationCreate from "./fields/affectedPopulation/Create";
  import MinimumDosageCreate from "./fields/minimumDosage/Create";
  import MaximumDosageCreate from "./fields/maximumDosage/Create";
  import MechanismOfActionCreate from "./fields/mechanismOfAction/Create";
  import RelatedDietaryItemsCreate from "./fields/relatedDietaryItems/Create";
  import RelatedHealthConditionsCreate from "./fields/relatedHealthConditions/Create";
  import RelatedSourcesCreate from "./fields/relatedSources/Create";
  import NutritionalInfoCreate from "./fields/nutritionalInfo/Create";
  import HealthInfoCreate from "./fields/healthInfo/Create";
  import SourceInfoCreate from "./fields/sourceInfo/Create";
  import LinkCreate from "./fields/link/Create";
  import { fade } from "svelte/transition";

  export let mainObjectType;

  //dicts
  let fieldCreateDict = {
    description: DescriptionCreate,
    affectedPopulation: AffectedPopulationCreate,
    minimumDosage: MinimumDosageCreate,
    maximumDosage: MaximumDosageCreate,
    mechanismOfAction: MechanismOfActionCreate,
    relatedDietaryItems: RelatedDietaryItemsCreate,
    relatedHealthConditions: RelatedHealthConditionsCreate,
    relatedSources: RelatedSourcesCreate,
    nutritionalInfo: NutritionalInfoCreate,
    healthInfo: HealthInfoCreate,
    sourceInfo: SourceInfoCreate,
    link: LinkCreate,
  };

  //get syncable fields for main object type
  let fieldNames = mainObjectFieldsDict[mainObjectType];

  //pair each field name with its empty body to be filled
  let fieldNameBodyPairs = [];

  fieldNames.forEach((name) => {
    fieldNameBodyPairs.push({ name, body: _.cloneDeep(newFieldDict[name]) });
  });

  let title = "title";

  //check no field has empty values - or in N/A case, update body
  const verifyFieldsCompletion = (fieldNameBodyPairs) => {
    fieldNameBodyPairs.forEach((fieldNameBodyPair) => {
      //if field is not mandatory and is marked as nA, update body
      if (
        !mainObjectMandatoryFieldsDict[mainObjectType].includes(
          fieldNameBodyPair.name
        ) &&
        fieldNameBodyPair.body.nA
      ) {
        fieldNameBodyPair.body = nAFieldDict[fieldNameBodyPair.name];
      }
      let emptyField = ObjectHasEmptyField(fieldNameBodyPair.body);
      if (emptyField) {
        Session.set("error", `Mandatory field missing: ${emptyField}`);
        throw new Meteor.Error(`Object has empty field: ${emptyField}`);
      }
    });
  };

  const handleSubmit = () => {
    //verify title isn't empty
    if (!title) {
      Session.set("error", "Title can't be empty");
      throw new Meteor.Error(
        "Title can't be empty",
        "User attempted to submit actionable finding with empty title"
      );
    }

    //strip outer whitespaces from title
    title = title.trim();

    //check title does not end with a number
    if (!isNaN(title.slice(-1))) {
      Session.set("error", "Title can't end with a number");
      throw new Meteor.Error(
        "Title can't end with a number as it could get confused with a titleCounter",
        "User attempted to submit object with title ending in a number"
      );
    }

    //verify no field has empty values
    verifyFieldsCompletion(fieldNameBodyPairs);

    Meteor.call(
      "mainObject.insert",
      mainObjectType,
      title,
      fieldNameBodyPairs,
      (error, result) => {
        if (error) {
          if (error.error == "validation-error") {
            Session.set("error", error.reason);
          } else if (error.error == "missing-mandatory-field") {
            Session.set("error", error.reason);
          } else {
            Session.set("error", "Server error, please try again later");
            throw new Meteor.Error(
              "Error while calling mainObject.insert method",
              error
            );
          }
        } else if (result) {
          //if title ends with a number, this means a counter was added - inform user
          // if(!isNaN(result.slice(-1))){
          //     Session.set('info', 'Title already in use, a counter was appended');
          // }
          router.goto("show/" + result);
        }
      }
    );
  };
</script>

<div in:fade={{ duration: 200 }}>
  <h2>Create New {mainObjectNameDict[mainObjectType]}:</h2>

  <div class="column-container">
    <div
      class="column"
      onmouseover="this.style.overflow='auto'"
      onmouseout="this.style.overflow='hidden'"
    >
      {#if mainObjectType != "actionableFindings"}
        <div class="field">
          <h3>Title:</h3>
          <input
            type="text"
            name="title"
            placeholder="Enter Title"
            bind:value={title}
          />
        </div>
      {/if}

      {#each fieldNameBodyPairs as fieldNameBodyPair}
        <div class="field">
          <svelte:component
            this={fieldCreateDict[fieldNameBodyPair.name]}
            fieldBody={fieldNameBodyPair.body}
            mandatory={mainObjectMandatoryFieldsDict[mainObjectType].includes(
              fieldNameBodyPair.name
            )}
            showFieldName={true}
          />
        </div>
      {/each}

      <button on:click={handleSubmit}>Submit</button>
    </div>
  </div>
</div>

<style>
  h2 {
    padding-top: 10px;
    color: darkgreen;
    text-align: center;
  }

  .column {
    width: 100%;
    height: 80vh;
  }
</style>
