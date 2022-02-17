<script>
  import { Session } from "meteor/session";
  // import { ObjectHasEmptyField } from "/imports/common/methods";
  import _ from "lodash";
  import FeedbackInfoCreate from "../fields/feedbackInfo/Create";
  import { newFeedback } from "../mainObjectShowStores";

  //state
  let feedbackInfoBody = {};
  newFeedback.subscribe((feedbackObject) => {
    let newFeedbackInfoBody = { nA: false, ...feedbackObject, text: "" };
    feedbackInfoBody = newFeedbackInfoBody;
  });

  const cancel = () => {
    newFeedback.set({});
  };

  const handleSubmit = () => {
    //check for empty fields
    // if (emptyField){
    //     Session.set('error', `Mandatory field missing: ${emptyField}`);
    //     throw new Meteor.Error(`Object has empty field: ${emptyField}`);
    // }

    //check for empty text
    if (!feedbackInfoBody.text) {
      Session.set("error", `Mandatory field missing: text`);
      throw new Meteor.Error(`Object has empty field: text`);
    }

    Meteor.call(
      "mainObject.insert",
      "feedbacks",
      "feedback",
      [{ name: "feedbackInfo", body: feedbackInfoBody }],
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
          //reset newFeedback
          newFeedback.set({});
        }
      }
    );
  };
</script>

<div>
  <FeedbackInfoCreate fieldBody={feedbackInfoBody} mandatory={true} />
  <button on:click={handleSubmit}>Submit</button>
  <button on:click={cancel}>Cancel</button>
</div>
