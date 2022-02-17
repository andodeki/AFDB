<script>
  export let fieldObject;
  import { DietaryItem } from "/imports/api/mainObjects/dietaryItemModel";

  let dietaryItemsLoading = true;
  let dietaryItems = [];

  let dietaryItemsSubscriber = Meteor.subscribe("dietaryItems");

  $m: {
    if (dietaryItemsSubscriber.ready()) {
      //filter with id
      fieldObject.body.all.forEach((dietaryItemId) => {
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
  <p>Version {fieldObject.version.number}</p>
  {#if !fieldObject.body.nA}
    {#if !dietaryItemsLoading}
      <ul>
        {#each dietaryItems as dietaryItem}
          <li>
            <a href={"/dietary-items/show/" + dietaryItem._id}
              >{dietaryItem.title}</a
            >
          </li>
        {/each}
      </ul>
    {/if}
  {:else}
    <p>
      <i>N/A</i>
    </p>
  {/if}
  <p>Author: {fieldObject.authorUsername}</p>
</div>
