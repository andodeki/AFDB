<script>
  import { Meteor } from "meteor/meteor";
  import { Session } from "meteor/session";
  import { router } from "tinro";
  import Field from "./fields/Field";
  import { ActionableFinding } from "/imports/api/mainObjects/actionableFindingModel";
  import { DebunkedMyth } from "/imports/api/mainObjects/debunkedMythModel";
  import { DietaryItem } from "/imports/api/mainObjects/dietaryItemModel";
  import { HealthCondition } from "/imports/api/mainObjects/healthConditionModel";
  import { Source } from "/imports/api/mainObjects/sourceModel";
  import { fade } from "svelte/transition";
  import FeedbackShow from "./feedback/Show";
  import { onMount } from "svelte";
  import Confirm from "/imports/ui/reusables/Confirm";
  import {
    Button,
    Icon,
    Tooltip,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Styles,
  } from "sveltestrap";
  // SMUI

  export let mainObjectId;
  export let mainObjectType;

  //reset all state variables
  import {
    feedbackLinks,
    availableSources,
    expandedSource,
    emphasizedHighlight,
    newHighlight,
    newFeedback,
    emphasizedField,
  } from "./mainObjectShowStores";

  onMount(() => {
    feedbackLinks.set([]);
    availableSources.set([]);
    expandedSource.set({});
    emphasizedHighlight.set("");
    newHighlight.set("");
    newFeedback.set({});
    emphasizedField.set("");
  });

  //id of field to highlight when hovering over feedback objects
  let highlightedFieldName = "";
  emphasizedField.subscribe((fieldName) => {
    highlightedFieldName = fieldName;
  });

  //show hide-button logic
  let showButton = true;

  expandedSource.subscribe((expandedObject) => {
    // if (expandedObject.sourceId) {
    //   showButton = true;
    // } else {
    //   showButton = false;
    // }

    // expandedObject.sourceId ? showButton = true : showButton = false

    showButton = expandedObject.sourceId ? true : false;

    // showButton = !!expandedObject.sourceId
  });

  //dict
  let objectTypeDict = {
    actionableFindings: ActionableFinding,
    debunkedMyths: DebunkedMyth,
    dietaryItems: DietaryItem,
    healthConditions: HealthCondition,
    sources: Source,
  };

  let mainObject;
  let mainObjectLoading = true;

  const softDelete = () => {
    router.goto("../index");

    Meteor.call("mainObject.remove", mainObject, (error, result) => {
      if (error) {
        Session.set("Error while calling softRemove server method");
        throw new Meteor.Error(
          "Error while calling softRemove server method",
          error
        );
      }
      if (result) {
        console.log(result);
      }
    });
  };

  let mainObjectsSubscriber = Meteor.subscribe(mainObjectType);
  let sourcesSubscriber = Meteor.subscribe("sources");

  $m: {
    if (mainObjectsSubscriber.ready()) {
      //need to use filter instead of findOne as findOne doesn't work with transient field
      mainObject = objectTypeDict[mainObjectType].findOne(
        { _id: mainObjectId },
        { defaults: true }
      );
      if (mainObject) {
        mainObjectLoading = false;
      } else {
        //if URL was invalid and no main object was found, go to 404
        router.goto("/404");
      }
    }

    if (sourcesSubscriber.ready() && mainObject.relatedSources) {
      availableSources.set([]);

      mainObject.relatedSources.body.all.forEach((sourceId) => {
        let source = Source.findOne(sourceId);

        //update store
        if (source) {
          availableSources.update((array) => [
            ...array,
            { sourceId: source._id, sourceTitle: source.title },
          ]);
        }
      });
    }
  }

  let isPdfOpen = false
	function handleViewPdf(event) {
// 		alert(event.detail.text);
		console.log(event.detail.state)
		isPdfOpen = event.detail.state
	}
</script>

<Styles />

<div class="column-container">
  <div class="actual-actionable-findings column left">
    {#if !mainObjectLoading}
      <h2 class="AF-title">
        {mainObject.title}
        {mainObject.titleCounter == 1 ? "" : mainObject.titleCounter}
      </h2>

      {#each mainObject.syncableFields as field}
        {#if field != "relatedSources"}
          <div
            id={field}
            in:fade={{ duration: 500 }}
            class="{highlightedFieldName === field
              ? 'highlighted'
              : ''} another-wrapper"
          >
            <Field {mainObject} {field} />
          </div>
        {/if}
      {/each}

      {#if mainObjectType == "actionableFindings" || mainObjectType == "debunkedMyths"}
        <div>
          <Confirm
            class="confirm"
            confirmTitle="Delete"
            cancelTitle="Cancel"
            let:confirm={confirmThis}
          >
            <button
              class="delete-button"
              on:click={() => confirmThis(softDelete)}
            >
              Delete
            </button>
            <span slot="title"> Delete this item? </span>
          </Confirm>
        </div>
      {/if}
    {/if}
  </div>

  <div class="column middle">
    {#if !mainObjectLoading}
      <FeedbackShow {mainObject} />
    {/if}
  </div>

  <div class="{isPdfOpen ? 'column right2' : 'column right'}">
    {#if !mainObjectLoading && mainObject.syncableFields.includes("relatedSources")}
      <div class="actionable_findings_sources_header">
        <div class="window-header-wrap">
          <div class="window-header orange">Sources</div>
          <Tooltip target="window-header" placement="bottom">
            <strong>Hello</strong> <i>World</i></Tooltip
          >
        </div>

        <!-- Sources Context Menu -->
        <div class="context-menu">
          <!-- More Actions -->
          {#if showButton}
            <button
              in:fade={{
                duration: 200,
              }}
              out:fade={{
                duration: 200,
              }}
              on:click={() => {
                expandedSource.set({});
                isPdfOpen = false
              }}>Hide</button
            >
          {/if}

          <!-- More-actions Menu -->
          <Dropdown class="drop-holder">
            <DropdownToggle class="btn_more-actions-toggle">...</DropdownToggle>
            <DropdownMenu>
              <DropdownItem>Edit</DropdownItem>
              <DropdownItem>See Edit History</DropdownItem>
              <DropdownItem>Comment</DropdownItem>
              <DropdownItem>Cite</DropdownItem>
              <DropdownItem divider />
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      <div
        in:fade={{ duration: 500 }}
        class="{highlightedFieldName === 'relatedSources'
          ? 'highlighted'
          : ''}sources-wrapper"
      >
        <Field {mainObject} field={"relatedSources"} on:viewpdf={handleViewPdf}/>
      </div>
    {/if}
  </div>
</div>

<style>
  .column.right2{
		padding: 10px;
	}
</style>
