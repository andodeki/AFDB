<script>
  export let fieldObject;
  export let expandable = false;
  import { Source } from "/imports/api/mainObjects/sourceModel";
  import Field from "../Field";
  import _ from "lodash";

  //state vars
  import { expandedSource } from "../../mainObjectShowStores";
  import { element } from "svelte/internal";
  import Show from "../../Show.svelte";
  let expandedId = "";
  let highlightMode = false;

  expandedSource.subscribe((expandedObject) => {
    if (expandedObject.sourceId) {
      expandedId = expandedObject.sourceId;
      highlightMode = expandedObject.highlightMode;
    } else {
      expandedId = "";
      highlightMode = false;
    }
  });

  let sourcesLoading = true;
  let sources = [];

  let sourcesSubscriber = Meteor.subscribe("sources");

  const toggleExpand = (sourceId, highlightMode = false) => {
    if (expandedId === sourceId) {
      hide();
    } else {
      expand(sourceId, highlightMode);
    }
  };

  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  function viewPdf() {
    dispatch('viewpdf', {
      state: true,
    });
  }
  const expand = (sourceId, highlightMode = false) => {
    viewPdf()
    expandedSource.set({ sourceId, highlightMode });
  };

  const hide = () => {
    expandedSource.set({});
  };

  // onDestroy(() => {
  //     window.removeEventListener("message", this.messageHandler, false);
  // });

  $m: {
    if (sourcesSubscriber.ready()) {
      //filter with id
      fieldObject.body.all.forEach((sourceId) => {
        let source = Source.findOne({ _id: sourceId });
        if (source && sources) {
          //avoid duplicates on sources array when fieldObject.body.all array is updated

          //check if sources already contains source with that id
          let search = sources.find((source) => source._id === sourceId);

          //if source is not already there, push it
          if (!search) {
            sources.push(source);
          } else {
            //otherwise, check whether source changed
            if (search.updatedAt != source.updatedAt) {
              //if so, remove the old one and push the new one
              sources = sources.filter((source) => source._id !== sourceId);
              sources.push(source);
            }
          }
        }

        //sort sources alphabetically
        sources = _.sortBy(sources, "title");
      });
      if (sources) {
        sourcesLoading = false;
      }
    }
  }
</script>

<div class="source-list-holder">
  <!-- Unused Version Number -->
  <p class="display-none">Version {fieldObject.version.number}</p>
  {#if !fieldObject.body.nA}
    {#if !sourcesLoading}
      {#each sources as source}
        <!-- This if else statement validates if expandable, if expandable, it sets the whole div to
      trigger the on click event that expands the source.We need to set this on click event on the entire source that does the following:

   1. Closes all already expanded sources-->

        {#if expandable}
          <div
            class="source"
            on:click={() => expand(source._id, highlightMode)}
          >
            {source.title}
            {#if source._id === expandedId}
              <!-- DEBUG FEEDBACK MODE -->
              <Field mainObject={source} field={"sourceInfo"} />
            {/if}
          </div>
        {:else}
          <!-- else show a format that does not allow expansion. Unsure how we should
          show this. -->
          <div
            class="source"
            on:click={() => expand(source._id, highlightMode)}
          >
            {source.title}

            <button>{source._id === expandedId ? "Hide" : "Expand"}</button>
            {#if source._id === expandedId}
              <!-- DEBUG FEEDBACK MODE -->
              <Field mainObject={source} field={"sourceInfo"} />
            {/if}
          </div>
        {/if}
      {/each}
    {/if}
  {:else}
    <p>
      x
      <i>N/A</i>
    </p>
  {/if}
  <!-- Hide Author -->
  <p class="display-none">Author: {fieldObject.authorUsername}</p>
</div>
