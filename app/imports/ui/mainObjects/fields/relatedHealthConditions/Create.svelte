<script>
  import { Session } from "meteor/session";
  import { HealthCondition } from "/imports/api/mainObjects/healthConditionModel";
  export let fieldBody;
  export let showFieldName = false;
  export let mandatory;

  let healthConditionId = "";

  let healthConditionsLoading = true;
  let healthConditions = [];

  let healthConditionsSubscriber = Meteor.subscribe("healthConditions");

  //adds healthConditionId to array
  const handleAdd = () => {
    //check for duplicates
    if (fieldBody.all.includes(healthConditionId)) {
      Session.set("error", "duplicate ID");
      throw new Meteor.Error(
        "dupicate-id",
        "user tried to insert a healthConditionId that is already in fieldBody.all"
      );
    }

    //check id corresponds to actual existing health condition
    if (
      !HealthCondition.find({})
        .fetch()
        .map((healthCondition) => healthCondition._id)
        .includes(healthConditionId)
    ) {
      Session.set("error", "Invalid Health Condition ID");
      throw new Meteor.Error(
        "invalid-id",
        "given health condition ID does not correspond to any existing health condition in the database"
      );
    }
    //I have no idea why, but using a copy is the only way to get the new item to show up instantaneously
    let copy = fieldBody.all;
    copy.push(healthConditionId);
    fieldBody.all = copy;

    //reset healthConditionId
    healthConditionId = "";
  };

  //removes healthConditionId from array
  const handleRemove = (healthConditionId) => {
    fieldBody.all = fieldBody.all.filter(
      (healthCondition) => healthCondition !== healthConditionId
    );
  };

  $m: {
    if (healthConditionsSubscriber.ready()) {
      //reset healthConditions array
      healthConditions = [];
      //filter with id
      fieldBody.all.forEach((healthConditionId) => {
        let healthCondition = HealthCondition.findOne({
          _id: healthConditionId,
        });
        if (healthCondition) {
          healthConditions.push(healthCondition);
        }
      });
      if (healthConditions) {
        healthConditionsLoading = false;
      }
    }
  }
</script>

<div>
  {#if showFieldName}
    <h3>Related Health Conditions:</h3>
  {/if}

  {#if !mandatory}
    <label for="N/A"><i>Mark as N/A: </i></label>
    <input type="checkbox" bind:checked={fieldBody.nA} />
    <br />
  {/if}
  {#if !fieldBody.nA}
    <label for="relatedHealthConditions"
      >Related Health Conditions IDs (add one at a time):</label
    >

    <ul>
      {#each healthConditions as healthCondition}
        <li>
          {healthCondition.title}
          <button on:click={handleRemove(healthCondition._id)}>Remove</button>
        </li>
      {/each}
    </ul>
    <br />
    <form on:submit|preventDefault={handleAdd}>
      <input
        type="text"
        name="newHealthCondition"
        placeholder="Type new health condition id"
        bind:value={healthConditionId}
      />
      <button type="submit">Add</button>
    </form>
  {/if}
</div>

<style>
  label {
    display: block;
  }
</style>
