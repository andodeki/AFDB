<script>
  import { Feedback } from "/imports/api/mainObjects/feedbackModel";
  import Field from "../fields/Field";
  import { fade } from "svelte/transition";
  import { mainObjectNameDict } from "/imports/common/dicts";
  import { ObjectEq } from "/imports/common/methods";
  import FeedbackCreate from "./Create";
  import _ from "lodash";
  import { onMount } from "svelte";
  import { PARENT_URL } from "/imports/common/consts";

  export let mainObject;

  //state
  import {
    feedbackLinks,
    availableSources,
    expandedSource,
    emphasizedHighlight,
    newFeedback,
    emphasizedField,
  } from "../mainObjectShowStores";

  let relatedSourceObjects = [];

  availableSources.subscribe((sourceObjects) => {
    if (sourceObjects) {
      relatedSourceObjects = sourceObjects;
    }
  });

  let highlightedFieldName;
  emphasizedField.subscribe((fieldName) => {
    highlightedFieldName = fieldName;
  });

  const setEmphasizedField = (fieldName) => {
    emphasizedField.set(fieldName);
  };

  const resetEmphasizedField = () => {
    emphasizedField.set("");
  };

  const scrollToField = () => {
    if (highlightedFieldName) {
      let element = document.getElementById(highlightedFieldName);
      element.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  //get feedbacks
  let feedbacks = [];
  let feedbacksLoading = true;

  //state
  let creatingFeedback;
  newFeedback.subscribe((feedbackObject) => {
    if (!ObjectEq(feedbackObject, {})) {
      creatingFeedback = true;
    } else {
      creatingFeedback = false;
    }
  });

  const createFeedback = (subtype) => {
    newFeedback.set({
      subtype,
      targetType: "mainObject",
      targetId: mainObject._id,
      targetName: mainObjectNameDict[mainObject.type + "s"],
    });
  };

  let feedbacksSubscriber = Meteor.subscribe("feedbacks");

  const expandSource = ({ sourceId, highlightMode }) => {
    if (!highlightMode) {
      highlightMode = false;
    }
    if (sourceId) {
      expandedSource.set({ sourceId: sourceId, highlightMode: highlightMode });
    }
  };

  const goToHighlight = ({ sourceId, highlightId }) => {
    if (sourceId && highlightId) {
      expandedSource.set({ sourceId, highlightMode: false });
      emphasizedHighlight.set(highlightId);
    }
  };

  //post message event listener
  onMount(() => {
    window.addEventListener("message", function (message) {
      const functionAdapter = { expandSource, goToHighlight };
      if (message.origin === PARENT_URL) {
        let functionName = message.data.function;
        let args = message.data.args;

        //call appropriate function
        if (functionName) {
          console.log(
            "Relevant incoming message in parent Feedback Show MessageHandler from same URL!"
          );
          if (functionAdapter[functionName]) {
            functionAdapter[functionName]({ ...args });
          } else {
            // throw new Error("invalid function name " + `'${functionName}'`);
          }
        }
      } else {
        console.log(
          "Message received on parent Feedback Show MessageHandler from invalid URL " +
            message.origin
        );
      }
    });
  });

  $m: {
    if (feedbacksSubscriber.ready()) {
      feedbacks = [];

      //main object feedbacks
      let mainObjectFeedbacks = Feedback.find({
        "feedbackInfo.body.targetType": "mainObject",
        "feedbackInfo.body.targetId": mainObject._id,
      }).fetch();
      if (mainObjectFeedbacks.length > 0) {
        feedbacks = feedbacks.concat(mainObjectFeedbacks);
      }

      // field feedbacks (on field objects)
      let currentFieldFeedbacks = Feedback.find({
        "feedbackInfo.body.targetType": "field",
        "feedbackInfo.body.targetId": mainObject._id,
      }).fetch();
      if (currentFieldFeedbacks.length > 0) {
        feedbacks = feedbacks.concat(currentFieldFeedbacks);
      }

      //source feedbacks (on sources themselves)
      if (relatedSourceObjects) {
        relatedSourceObjects.forEach((sourceObject) => {
          let currentSourceFeedbacks = Feedback.find({
            "feedbackInfo.body.targetType": "source",
            "feedbackInfo.body.targetId": sourceObject.sourceId,
          }).fetch();
          if (currentSourceFeedbacks.length > 0) {
            feedbacks = feedbacks.concat(currentSourceFeedbacks);
          }
        });
      }

      //reply feedbacks
      feedbacks.forEach((feedback) => {
        let currentFeedbackReplies = Feedback.find({
          "feedbackInfo.body.targetType": "feedback",
          "feedbackInfo.body.targetId": feedback._id,
        }).fetch();
        if (currentFeedbackReplies.length > 0) {
          feedbacks = feedbacks.concat(currentFeedbackReplies);
        }
      });

      //sort by last updated
      feedbacks = _.sortBy(feedbacks, "updatedAt");

      feedbacksLoading = false;
    }

    if (feedbacks) {
      let currentFeedbackLinks = [];
      feedbacks.forEach((feedback) => {
        if (feedback.feedbackInfo.body.feedbackLinks) {
          currentFeedbackLinks = currentFeedbackLinks.concat(
            feedback.feedbackInfo.body.feedbackLinks
          );
        }
      });

      //update store
      feedbackLinks.set(currentFeedbackLinks);
    }
  }
</script>

<h3>Comments & Citations</h3>
{#if !feedbacksLoading}
  <div class="new-feedback-container">
    {#if !creatingFeedback}
      <button
        class="new-feedback-button"
        on:click={() => createFeedback("comment")}
      >
        <p>Add comment on {mainObjectNameDict[mainObject.type + "s"]}</p>
      </button>
    {:else}
      <div class="new-feedback">
        <FeedbackCreate />
      </div>
    {/if}
  </div>

  {#each feedbacks as feedback}
    <div
      class="feedback"
      in:fade={{ duration: 500 }}
      on:mouseenter={feedback.feedbackInfo.body.targetType === "field"
        ? () => setEmphasizedField(feedback.feedbackInfo.body.targetName)
        : () => {}}
      on:mouseleave={resetEmphasizedField}
      on:click={scrollToField}
    >
      <Field mainObject={feedback} field={"feedbackInfo"} />
    </div>
  {/each}
{/if}

<style>
  .feedback {
    background: none;
    border-bottom: 1px solid #2f3336;
    border-radius: 0;
    margin: 0;
    padding: 39px 50px 50px;
  }

  .new-feedback-container {
    justify-content: center;
    display: flex;
  }

  .new-feedback {
    background-color: white;
    color: #5b9059;
    font-size: 16px;
    display: block;
    border-radius: 10px;
    overflow: auto;
    padding: 5px;
    text-align: center;
    width: 92%;
  }

  .new-feedback-button {
    background-color: white;
    color: #5b9059;
    font-size: 16px;
    display: block;
    border-radius: 10px;
    overflow: auto;
    padding: 5px;
    text-align: center;
    width: 90%;
    margin: 5px;
  }

  .new-feedback-button:hover {
    background-color: #5b9059;
    color: white;
  }

  .highlighted {
    border-right: 10px solid #5b9059;
    border-left: 10px solid #5b9059;
    border-top: 0.5px solid #5b9059;
    border-bottom: 0.5px solid #5b9059;
    background-color: #5b9059;
    border-radius: 15px;
    box-sizing: border-box;
    position: relative;
    transition: all 0.1s;
  }
</style>
