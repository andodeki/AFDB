<script>
  import { Session } from "meteor/session";
  import { DietaryItem } from "/imports/api/mainObjects/dietaryItemModel";
  export let fieldBody;
  export let showFieldName = false;
  export let mandatory;

  let dietaryItemId = "";

  let dietaryItemsLoading = true;
  let dietaryItems = [];

  let dietaryItemsSubscriber = Meteor.subscribe("dietaryItems");

  //adds dietaryItemId to array
  const handleAdd = () => {
    //check for duplicates
    if (fieldBody.all.includes(dietaryItemId)) {
      Session.set("error", "duplicate ID");
      throw new Meteor.Error(
        "dupicate-id",
        "user tried to insert a dietaryItemId that is already in fieldBody.all"
      );
    }
    //I have no idea why, but using a copy is the only way to get the new item to show up instantaneously
    let copy = fieldBody.all;
    copy.push(dietaryItemId);
    fieldBody.all = copy;

    //reset dietaryItemId
    dietaryItemId = "";
  };

  //removes dietaryItemId from array
  const handleRemove = (dietaryItemId) => {
    fieldBody.all = fieldBody.all.filter(
      (dietaryItem) => dietaryItem !== dietaryItemId
    );
  };

  $m: {
    if (dietaryItemsSubscriber.ready()) {
      //reset dietaryItems array
      dietaryItems = [];
      //filter with id
      fieldBody.all.forEach((dietaryItemId) => {
        let dietaryItem = DietaryItem.findOne({ _id: dietaryItemId });
        if (dietaryItem) {
          dietaryItems.push(DietaryItem.findOne({ _id: dietaryItemId }));
        }
      });
      if (dietaryItems) {
        dietaryItemsLoading = false;
      }
    }
  }
</script>

<div>
  {#if showFieldName}
    <h3>Related Dietary Items:</h3>
  {/if}

  {#if !mandatory}
    <label for="N/A"><i>Mark as N/A: </i></label>
    <input type="checkbox" bind:checked={fieldBody.nA} />
    <br />
  {/if}
  {#if !fieldBody.nA}
    <label for="relatedDietaryItems"
      >Related Dietary Item IDs (add one at a time):</label
    >

    <ul>
      {#each dietaryItems as dietaryItem}
        <li>
          {dietaryItem.title}
          <button on:click={handleRemove(dietaryItem._id)}>Remove</button>
        </li>
      {/each}
    </ul>
    <br />
    <form on:submit|preventDefault={handleAdd}>
      <input
        type="text"
        name="newDietaryItemId"
        placeholder="Type new dietary item id"
        bind:value={dietaryItemId}
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
