<script>
  import { ActionableFinding } from "/imports/api/mainObjects/actionableFindingModel";
  import { DebunkedMyth } from "/imports/api/mainObjects/debunkedMythModel";
  import { DietaryItem } from "/imports/api/mainObjects/dietaryItemModel";
  import { HealthCondition } from "/imports/api/mainObjects/healthConditionModel";
  import { Source } from "/imports/api/mainObjects/sourceModel";
  import { fade } from "svelte/transition";

  //dict
  let objectTypeDict = {
    actionableFindings: ActionableFinding,
    debunkedMyths: DebunkedMyth,
    dietaryItems: DietaryItem,
    healthConditions: HealthCondition,
    sources: Source,
  };

  export let mainObjectType;

  let mainObjectsLoading = true;
  let mainObjects = [];

  let mainObjectsSubscriber = Meteor.subscribe(mainObjectType);

  $m: {
    if (mainObjectsSubscriber.ready()) {
      mainObjects = objectTypeDict[mainObjectType]
        .find({}, { defaults: true })
        .fetch();
      if (mainObjects) {
        mainObjectsLoading = false;
      }
    }
  }
</script>

<div class="column-container">
  <!-- Left column - Food Search -->
  <div class="column left left-index-column" />
  <div class="column middle middle-index-column">
    <div class="item-listed" in:fade={{ duration: 200 }}>
      {#if !mainObjectsLoading}
        <a class="first-of-list" href="new">Create New</a>
        {#each mainObjects as mainObject}
          <a class="rest-of-list" href={"show/" + mainObject._id}
            >{mainObject.title}</a
          >
        {/each}
      {/if}
    </div>
  </div>
  <!-- Right column - Condition Search -->
  <div class="column right right-index-column" />
</div>

<style>
  .column-container {
    position: relative;
    height: 100%;
    display: flex;
    width: 100%;
    box-sizing: border-box;
  }

  .middle-index-column {
    width: 60%;
    text-align: center;
    padding: 50px;
  }
  .left,
  .right {
    background-color: #212020;
  }
  .right {
    width: 30%;
  }
  .middle {
    width: 40%;
    overflow: auto;
  }
  .left {
    width: 30%;
  }
</style>
