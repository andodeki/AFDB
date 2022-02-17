<script>
  //imports
  import { Meteor } from "meteor/meteor";
  import { Session } from "meteor/session";
  import _ from "lodash";
  import VersionNote from "./VersionNote.svelte";
  import DescriptionShow from "./description/Show";
  import AffectedPopulationShow from "./affectedPopulation/Show";
  import MinimumDosageShow from "./minimumDosage/Show";
  import MaximumDosageShow from "./maximumDosage/Show";
  import MechanismOfActionShow from "./mechanismOfAction/Show";
  import RelatedDietaryItemsShow from "./relatedDietaryItems/Show";
  import RelatedHealthConditionsShow from "./relatedHealthConditions/Show";
  import RelatedSourcesShow from "./relatedSources/Show";
  import NutritionalInfoShow from "./nutritionalInfo/Show";
  import HealthInfoShow from "./healthInfo/Show";
  import SourceInfoShow from "./sourceInfo/Show";
  import LinkShow from "./link/Show";
  import FeedbackInfoShow from "./feedbackInfo/Show";
  import DescriptionCreate from "./description/Create";
  import AffectedPopulationCreate from "./affectedPopulation/Create";
  import MinimumDosageCreate from "./minimumDosage/Create";
  import MaximumDosageCreate from "./maximumDosage/Create";
  import MechanismOfActionCreate from "./mechanismOfAction/Create";
  import RelatedDietaryItemsCreate from "./relatedDietaryItems/Create";
  import RelatedHealthConditionsCreate from "./relatedHealthConditions/Create";
  import RelatedSourcesCreate from "./relatedSources/Create";
  import NutritionalInfoCreate from "./nutritionalInfo/Create";
  import HealthInfoCreate from "./healthInfo/Create";
  import SourceInfoCreate from "./sourceInfo/Create";
  import LinkCreate from "./link/Create";
  import FeedbackInfoCreate from "./feedbackInfo/Create";
  import { ObjectHasEmptyField, ObjectEq } from "/imports/common/methods";
  import {
    fieldNameDict,
    mainObjectMandatoryFieldsDict,
  } from "/imports/common/dicts";
  import Hoverable from "../../reusables/Hoverable";
  import { fade } from "svelte/transition";
  import { newFeedback } from "../mainObjectShowStores";
  import Confirm from "/imports/ui/reusables/Confirm";

  //props
  export let mainObject;
  export let field;

  //feedback
  const createFeedback = (subtype, field) => {
    if (mainObject.type === "feedback") {
      newFeedback.set({
        subtype,
        targetType: "feedback",
        targetId: mainObject._id,
        targetName: `${mainObject.feedbackInfo.authorUsername}'s ${subtype}`,
      });
    } else if (field !== "sourceInfo") {
      newFeedback.set({
        subtype,
        targetType: "field",
        targetId: mainObject._id,
        targetName: field,
        targetVersion: mainObject[field].version.number,
      });
    } else {
      newFeedback.set({
        subtype,
        targetType: "source",
        targetId: mainObject._id,
        targetName: mainObject.title,
        targetVersion: mainObject[field].version.number,
      });
    }
  };

  const removeFeedback = (feedback) => {
    Meteor.call("mainObject.remove", feedback);
  };

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
    feedbackInfo: FeedbackInfoCreate,
  };
  let fieldShowDict = {
    description: DescriptionShow,
    affectedPopulation: AffectedPopulationShow,
    minimumDosage: MinimumDosageShow,
    maximumDosage: MaximumDosageShow,
    mechanismOfAction: MechanismOfActionShow,
    relatedDietaryItems: RelatedDietaryItemsShow,
    relatedHealthConditions: RelatedHealthConditionsShow,
    relatedSources: RelatedSourcesShow,
    nutritionalInfo: NutritionalInfoShow,
    healthInfo: HealthInfoShow,
    sourceInfo: SourceInfoShow,
    link: LinkShow,
    feedbackInfo: FeedbackInfoShow,
  };

  /*******************************************************************************************************
    Edit History Mode - This is the mode used to see the version history of a field
        versionsArray: stores all versions of a field
        selectedVersionNumber: var to bind to version select
        softField: the selected field shown when seeing edit history - it will be initialized in a method as the current field
        preSoftField: the field version immediatly prior to a selected version, to show pre/post edit differences
    ********************************************************************************************************/

  //initializing vars
  let editHistoryMode = false;
  let versionsArray = []; //stores all versions of a field
  let softField;
  let selectedVersionNumber; //var to bind to version select
  let preSoftField;

  //method to update soft field as current field
  //also updates selected version number
  const updateSoftField = () => {
    softField = mainObject[field];
    selectedVersionNumber = mainObject[field].version.number;
  };

  //method to update pre soft field as version prior to current soft field
  const updatePreSoftField = () => {
    if (softField && selectedVersionNumber != 1) {
      Meteor.call(
        "mainObject.getFieldObject",
        mainObject,
        field,
        selectedVersionNumber - 1,
        (error, result) => {
          if (error) {
            Session.set("error", "Server error, please try again later");
            throw new Meteor.Error(
              "Error while calling mainObject.getFieldObject method: ",
              error
            );
          } else if (result) {
            preSoftField = result;
          }
        }
      );
    } else {
      preSoftField = false;
    }
  };

  //initialize soft field and pre soft field
  updateSoftField();
  updatePreSoftField();

  //method to update versionsArray to reflect the current number of versions of the field
  const updateVersionsArray = () => {
    Meteor.call(
      "mainObject.getFieldVersions",
      mainObject,
      field,
      (error, result) => {
        if (error) {
          Session.set("error", "Server error, please try again later");
          throw new Meteor.Error(
            "Error while calling mainObject.getFieldVersions method: ",
            error
          );
        } else if (result) {
          versionsArray = Array.from({ length: result }, (_, i) => i + 1);
        }
      }
    );
  };

  //method to get new soft field upon selecting a version
  //also makes call to update pre soft field
  const handleVersionSelect = () => {
    Meteor.call(
      "mainObject.getFieldObject",
      mainObject,
      field,
      selectedVersionNumber,
      (error, result) => {
        if (error) {
          Session.set("error", "Server error, please try again later");
          throw new Meteor.Error(
            "Error while calling mainObject.getFieldObject method: ",
            error
          );
        } else if (result) {
          softField = result;
          updatePreSoftField();
        }
      }
    );
  };

  //method to toggle edit history mode on and off, also updates relevant things on each toggle
  const toggleEditHistoryMode = () => {
    //first, update versions array, soft field, and pre soft field
    updateVersionsArray();
    updateSoftField();
    updatePreSoftField();

    //toggle edit history mode
    editHistoryMode = !editHistoryMode;
  };

  /*******************************************************************************************************
    Reversion Mode - This is the mode used to submit a reversion of a field to an older version
        newFieldVersionNote: 'edit note' to put on a specific version change
    ********************************************************************************************************/

  //initializing vars
  let reversionMode = false;
  let newFieldVersionNote = { note: "", action: "" }; //note is note text, action is reversion or edit

  //method to toggle reversion mode on and off, also updates relevant things on each toggle
  const toggleReversionMode = () => {
    //first, clear new field version note
    newFieldVersionNote = { note: "", action: "reversion" };

    //toggle
    reversionMode = !reversionMode;
  };

  //method to call toggleEditHistoryMode and toggleReversionMode methods at the same time
  const toggleEditHistoryModeAndReversionModeOff = () => {
    editHistoryMode = false;
    reversionMode = false;
  };

  //method to revert to an older version of a field
  //it works by creating a new version with the content of the old version being reverted to
  const setFieldVersion = () => {
    let reversionVersionNumber;
    let reversionOriginalAuthorId;

    //if reverting to a reversion, revert to original version
    if (softField.version.isReversion) {
      Session.set(
        "info",
        "Trying to revert to a reversion, reverting to original version instead"
      );
      reversionVersionNumber = softField.version.reversionNumber;
      reversionOriginalAuthorId = softField.version.reversionOriginalAuthorId;
    } else {
      reversionVersionNumber = softField.version.number;
      reversionAuthorId = softField.authorId;
    }

    //if current version is already a reversion, make sure you don't revert back to that version again
    if (
      mainObject[field].version.isReversion &&
      mainObject[field].version.reversionNumber == reversionVersionNumber
    ) {
      Session.set(
        "error",
        "Can't revert back to the same version as current version"
      );
      throw new Meteor.Error(
        "Can't revert back to the same version again.",
        "User tried to revert to a version that the current version is already a reversion to"
      );
    }

    //create a new version with the content from version user wants to revert to (softField)
    Meteor.call(
      "mainObject.revertField",
      mainObject,
      field,
      reversionVersionNumber,
      newFieldVersionNote.note,
      (error, result) => {
        if (error) {
          if (error.reason.error == "validation-error") {
            Session.set("error", error.reason.reason);
          } else {
            Session.set("error", "Server error, please try again later");
            throw new Meteor.Error(
              "Error while calling mainObject.insert method",
              error
            );
          }
        } else {
          toggleEditHistoryModeAndReversionModeOff();
        }
      }
    );
  };

  /*******************************************************************************************************
    Edit Mode - This is the mode used to update a field by submitting a new version
        newFieldBody: Body of new field version to be set as current version
    ********************************************************************************************************/

  //initializing vars
  let editMode = false;
  let newFieldBody;

  //toggle edit mode on and off
  const toggleEditMode = () => {
    //if entering edit mode, update new field info and clear new field version note
    if (!editMode) {
      newFieldBody = _.cloneDeep(mainObject[field].body);
      newFieldVersionNote = { note: "", action: "edit" };
    }

    editMode = !editMode;
  };

  //method to handle submitting an edit as a new field version
  const newFieldSubmit = () => {
    //check that new field body doesn't have any empty values
    let emptyField = ObjectHasEmptyField(newFieldBody);
    if (emptyField && field !== "feedbackInfo") {
      Session.set("error", `Mandatory field missing: ${emptyField}`);
      throw new Meteor.Error(
        `Object has empty field: ${emptyField}`,
        "User tried to submit a new field with a missing attribute"
      );
    }

    //feedback case
    if (field === "feedbackInfo") {
      if (newFieldBody.text === "") {
        Session.set("error", `Mandatory field missing: text`);
        throw new Meteor.Error(
          `Object has empty field: text`,
          "User tried to submit a new field with a missing attribute"
        );
      }
    }

    if (!ObjectEq(newFieldBody, mainObject[field].body)) {
      Meteor.call(
        "mainObject.updateField",
        mainObject,
        field,
        newFieldBody,
        newFieldVersionNote.note,
        (error, result) => {
          if (error) {
            if (error.error == "validation-error") {
              Session.set("error", error.reason);
            } else {
              Session.set("error", "Server error, please try again later");
              throw new Meteor.Error(
                "Error while calling mainObject.insert method",
                error
              );
            }
          } else {
            toggleEditMode();
          }
        }
      );
    } else {
      Session.set("error", "No changes detected");
    }
  };
</script>

<div class="field-second-wrapper">
  <div
    class="{field == 'sourceInfo' ||
    field == 'relatedSources' ||
    field == 'feedbackInfo'
      ? ''
      : 'field'} yet-another-field-wrapper"
  >
    <div class={field === "relatedSources" ? "relatedSourcesHeader" : ""}>
      <h2>
        {fieldNameDict[field]}
      </h2>
    </div>

    {#if !editMode}
      {#if !editHistoryMode}
        {#if field === "sourceInfo"}
          <svelte:component
            this={fieldShowDict[field]}
            fieldObject={mainObject[field]}
            showPDF={true}
          />
        {:else if field === "relatedSources"}
          <svelte:component
            this={fieldShowDict[field]}
            fieldObject={mainObject[field]}
            expandable={true}
            on:viewpdf
          />
        {:else}
          <svelte:component
            this={fieldShowDict[field]}
            fieldObject={mainObject[field]}
          />
        {/if}
        <!-- {#if active} -->

        <!-- Disabled editting options -->
        <div class="control-options" in:fade={{ duration: 200 }}>
          {#if field !== "feedbackInfo"}
            <button on:click={toggleEditMode}> Edit </button>
            <button on:click={toggleEditHistoryMode}> See Edit History</button>
            <button on:click={() => createFeedback("comment", field)}>
              Comment
            </button>
            {#if field !== "sourceInfo"}
              <button on:click={() => createFeedback("citation", field)}>
                Cite
              </button>
            {/if}
          {:else}
            {#if !(mainObject.feedbackInfo.body.targetType === "feedback")}
              <button
                on:click={createFeedback(
                  mainObject.feedbackInfo.body.subtype,
                  null
                )}
              >
                Reply
              </button>
            {/if}
            {#if Meteor.userId() === mainObject.feedbackInfo.authorId}
              <button on:click={toggleEditMode}> Edit </button>
              <Confirm
                class="confirm"
                confirmTitle="Delete"
                cancelTitle="Cancel"
                let:confirm={confirmThis}
              >
                <button
                  class="delete-button"
                  on:click={() => confirmThis(removeFeedback, mainObject)}
                >
                  Delete
                </button>
                <span slot="title"> Delete this item? </span>
              </Confirm>
            {/if}
          {/if}
        </div>
        <!-- {/if} -->
      {:else}
        <h4>Current Version:</h4>
        <svelte:component
          this={fieldShowDict[field]}
          fieldObject={mainObject[field]}
        />
        {#if softField}
          {#if preSoftField}
            <h4>
              Version Before {softField.version.number ==
              mainObject[field].version.number
                ? "Current"
                : "Selected"} Version:
            </h4>
            <svelte:component
              this={fieldShowDict[field]}
              fieldObject={preSoftField}
            />
          {/if}
          {#if softField.version.number != mainObject[field].version.number}
            <div>
              <h4>Selected Version:</h4>
              <svelte:component
                this={fieldShowDict[field]}
                fieldObject={softField}
              />
            </div>
          {/if}
          {#if softField.version.note}
            <h4>Edit Note: {softField.version.note}</h4>
          {/if}
          {#if softField.version.isReversion}
            <p>
              <em
                >This edit was a reversion to version {softField.version
                  .reversionNumber} by {softField.version
                  .reversionOriginalAuthorUsername}</em
              >
            </p>
          {/if}
        {/if}

        <label for="fieldVersions">See a Different Version:</label>
        <select
          bind:value={selectedVersionNumber}
          on:change={handleVersionSelect}
        >
          {#each versionsArray as versionNumber}
            <option value={versionNumber}>
              {versionNumber}
            </option>
          {/each}
        </select>
        <button on:click={toggleEditHistoryModeAndReversionModeOff}>
          Cancel
        </button>
        {#if mainObject[field].version.number != softField.version.number}
          <button on:click={toggleReversionMode}>Revert to this Version</button>
          {#if reversionMode}
            <VersionNote noteObject={newFieldVersionNote} />
            <button on:click={setFieldVersion}>Submit</button>
          {/if}
        {/if}
      {/if}
    {:else}
      {#if field === "feedbackInfo"}
        <svelte:component
          this={fieldCreateDict[field]}
          fieldBody={newFieldBody}
          mandatory={mainObjectMandatoryFieldsDict[
            mainObject.type + "s"
          ].includes(field)}
        />
      {:else}
        <svelte:component
          this={fieldCreateDict[field]}
          fieldBody={newFieldBody}
          mandatory={mainObjectMandatoryFieldsDict[
            mainObject.type + "s"
          ].includes(field)}
        />
        <VersionNote noteObject={newFieldVersionNote} />
      {/if}
      <button on:click={newFieldSubmit}> Submit </button>
      <button on:click={toggleEditMode}> Cancel </button>
    {/if}
  </div>
</div>

<style>
  .field {
    padding: 10px;
    color: white;
  }

  .relatedSourcesHeader {
    display: none;
  }
</style>
