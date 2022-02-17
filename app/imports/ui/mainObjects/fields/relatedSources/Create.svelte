<script>
  import { Session } from "meteor/session";
  import { Source } from "/imports/api/mainObjects/sourceModel";
  export let fieldBody;
  export let showFieldName = false;
  export let mandatory;

  let sourceId = "";

  let sourcesLoading = true;
  let sources = [];

  let sourcesSubscriber = Meteor.subscribe("sources");

  //adds sourceId to array
  const handleAdd = () => {
    //check for duplicates
    if (fieldBody.all.includes(sourceId)) {
      Session.set("error", "duplicate ID");
      throw new Meteor.Error(
        "dupicate-id",
        "user tried to insert a sourceId that is already in fieldBody.all"
      );
    }

    //check id corresponds to actual existing source
    if (
      !Source.find({})
        .fetch()
        .map((source) => source._id)
        .includes(sourceId)
    ) {
      Session.set("error", "Invalid Source ID");
      throw new Meteor.Error(
        "invalid-id",
        "given source ID does not correspond to any existing source in the database"
      );
    }
    //I have no idea why, but using a copy is the only way to get the new item to show up instantaneously
    let copy = fieldBody.all;
    copy.push(sourceId);
    fieldBody.all = copy;

    //reset sourceId
    sourceId = "";
  };

  //removes sourceId from array
  const handleRemove = (sourceId) => {
    fieldBody.all = fieldBody.all.filter((source) => source !== sourceId);
  };

  $m: {
    if (sourcesSubscriber.ready()) {
      //reset sources array
      sources = [];
      //filter with id
      fieldBody.all.forEach((sourceId) => {
        let source = Source.findOne({ _id: sourceId });
        if (source) {
          sources.push(source);
        }
      });
      if (sources) {
        sourcesLoading = false;
      }
    }
  }
</script>

<div>
  {#if showFieldName}
    <h3>Sources:</h3>
  {/if}

  {#if !mandatory}
    <label for="N/A"><i>Mark as N/A: </i></label>
    <input type="checkbox" bind:checked={fieldBody.nA} />
    <br />
  {/if}
  {#if !fieldBody.nA}
    <label for="relatedSources">Related Sources IDs (add one at a time):</label>

    <ul>
      {#each sources as source}
        <li>
          {source.title}
          <button on:click={handleRemove(source._id)}>Remove</button>
        </li>
      {/each}
    </ul>
    <br />
    <form on:submit|preventDefault={handleAdd}>
      <input
        type="text"
        name="newSource"
        placeholder="Type new source id"
        bind:value={sourceId}
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
