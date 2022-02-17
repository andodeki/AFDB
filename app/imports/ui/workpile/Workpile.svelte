<script>
  import { Meteor } from "meteor/meteor";
  import { Source } from "/imports/api/mainObjects/sourceModel";
  import Content from "./AddSourceModalContent.svelte";
  import Modal from "../reusables/Modal.svelte";
  import { modal } from "../reusables/modalStores.js";
  import { router } from "tinro";

  let sourcesSubscriber = Meteor.subscribe("sources");
  let sources = [];
  $m: {
    if (sourcesSubscriber.ready()) {
      sources = Source.find().fetch();
    }
  }

  const selectSource = (sourceId) => {
    router.goto("workpile/inspect-source/" + sourceId);
  };
</script>

<div class="column-container">
  <div class="column left">
    <h1>Workpile</h1>

    <div class="info-text">
      <span>
        <p>
          The sources to the right have been added by your fellow content
          experts because they may contain valuable information.
        </p>

        <br />

        <p>
          You can contribute to this project by reading and extracting useful
          content, or adding sources to this work pile.
        </p>
      </span>
    </div>
  </div>

  <div class="column right">
    <h1>Sources</h1>

    <div class="add-source-container">
      <Modal show={$modal}>
        <Content />
      </Modal>
    </div>

    <div class="sources-list">
      {#if sources}
        {#each sources as source}
          <div class="source-button" on:click={selectSource(source._id)}>
            <span class="source-title">{source.title}</span>
          </div>
        {/each}
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
    width: 35%;
  }

  .right {
    width: 65%;
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

  .add-source-container {
    display: flex;
    margin: 4em;
    height: 10%;
    text-align: center;
    justify-content: center;
    align-items: center;
  }

  .source-button {
    display: flex;
    background-color: #1ed760;
    margin: 1em;
    border-radius: 15px;
    height: 2em;
    align-items: center;
    text-align: center;
    justify-content: center;
  }

  .source-button:hover {
    background-color: lightgreen;
  }

  .source-title {
    font-weight: bold;
  }
</style>
