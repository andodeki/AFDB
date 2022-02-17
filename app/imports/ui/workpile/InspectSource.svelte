<script>
  import { Meteor } from "meteor/meteor";
  import { router } from "tinro";
  import Field from "/imports/ui/mainObjects/fields/Field";
  import { Source } from "/imports/api/mainObjects/sourceModel";
  export let sourceId;

  let sourcesSubscriber = Meteor.subscribe("sources");
  let source;

  $m: {
    if (sourcesSubscriber.ready()) {
      source = Source.findOne({ _id: sourceId });

      if (!source) {
        router.goto("/404");
      }
    }
  }

  const create = (mainObjectType) => {
    switch (mainObjectType) {
      case "actionableFinding":
        console.log("actionableFinding selected");
        break;
      case "debunkedMyth":
        console.log("debunkedMyth selected");
        break;
      case "nutritionalComposition":
        console.log("nutritionalComposition selected");
        break;
    }
  };
</script>

<div class="column-container">
  <div class="column left">
    <h1>Workpile</h1>

    <div class="info-text">
      <span>
        <p>Please go through the source on your right carefully.</p>

        <br />

        <p>Is this source useful? If so, for what?</p>

        <button
          class="create-button"
          on:click={() => create("actionableFinding")}
        >
          Actionable Finding
        </button>

        <button class="create-button" on:click={() => create("debunkedMyth")}>
          Debunked Myth
        </button>

        <button
          class="create-button"
          on:click={() => create("nutritionalComposition")}
        >
          Nutritional Composition
        </button>
      </span>
    </div>
  </div>

  <div class="column right">
    <h1>Source</h1>
    <div>
      {#if source}
        <Field mainObject={source} field={"sourceInfo"} />
      {/if}
    </div>
  </div>
</div>

<style>
  h1 {
    color: white;
    font-size: 2em;
  }

  p {
    color: white;
    font-size: 1.5em;
    width: 100%;
  }

  .left {
    width: 20%;
  }

  .right {
    width: 80%;
  }

  .info-text {
    height: 80%;
    color: #fff;
    text-align: center;
    padding: 0 20px;
    margin: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .create-button {
    margin: 0.5em;
  }
</style>
