<script>
  import { onDestroy, onMount } from "svelte";

  export let fieldObject;
  export let showPDF = false;
  import { Highlights } from "/imports/db/collections";
  import { fly } from "svelte/transition";
  import {
    feedbackLinks,
    expandedSource,
    newHighlight,
    emphasizedHighlight,
  } from "../../mainObjectShowStores";

  import { CHILD_URL, PARENT_URL } from "/imports/common/consts";

  let highlightMode = false;
  expandedSource.subscribe((sourceObject) => {
    highlightMode = sourceObject.highlightMode;
  });

  let fileId = fieldObject.body.fileId;
  let iFrameLoaded = false;
  let highlights = [];
  let highlightIds = [];
  let childWindow;
  let scrollHighlightId = "";

  emphasizedHighlight.subscribe((highlightId) => {
    if (highlightId) {
      scrollHighlightId = highlightId;

      //reset local and store vars
      scrollHighlightId = "";
      emphasizedHighlight.set("");
    }
  });

  let availableHighlightIds;

  feedbackLinks.subscribe((links) => {
    if (links) {
      availableHighlightIds = links.map((link) => link.highlightId);
    }
  });

  const insertHighlight = ({ highlight }) => {
    if (highlight) {
      Meteor.call("highlights.insert", fileId, highlight, (error, response) => {
        if (response && !error) {
          if (highlightMode) {
            newHighlight.set(response);
            highlightMode = false;
          }
        }
      });
    }
  };

  const setScrollHighlightId = ({ highlightId }) => {
    if (highlightId) {
      scrollHighlightId = highlightId;
    }
  };

  const goToHighlight = () => {
    if (
      iFrameLoaded &&
      childWindow &&
      highlightIds &&
      highlightIds.includes(scrollHighlightId)
    ) {
      document.getElementById(fileId).contentWindow.postMessage(
        {
          function: "setHighlightHash",
          fileId: fileId,
          args: { highlightId: scrollHighlightId },
        },
        CHILD_URL + "/react-pdf-highlighter/?fileId=" + fileId
      );
      //reset scrollHighlightId var
      scrollHighlightId = "";
    }
  };

  onMount(() => {
    //logic to receive messages from child iframe
    window.addEventListener("message", function (message) {
      // function adapter
      const functionAdapter = {
        // saveHighlights,
        insertHighlight,
        goToHighlight: setScrollHighlightId,
      };

      if (message.origin === CHILD_URL) {
        if (childWindow && message.source === childWindow) {
          //sanity check
          console.log(
            "incoming message in parent sourceInfo MessageHandler from child window!"
          );

          //parse input
          let childFileId = message.data.fileId;
          let functionName = message.data.function;
          let args = message.data.args;

          if (childFileId === fileId) {
            //call appropriate function
            if (functionName) {
              if (functionAdapter[functionName]) {
                functionAdapter[functionName]({ ...args });
              } else {
                // throw new Error("invalid function name " + `'${functionName}'`);
              }
            }
          }
        }
      } else if (message.origin === PARENT_URL) {
        //sanity check

        //parse input
        let functionName = message.data.function;
        let args = message.data.args;

        //call appropriate function
        if (functionName) {
          console.log(
            "relevant incoming message in parent sourceInfo MessageHandler from same URL!"
          );
          if (functionAdapter[functionName]) {
            functionAdapter[functionName](args);
          } else {
            throw new Error("invalid function name " + `'${functionName}'`);
          }
        }
      } else {
        console.log(
          "Message received on parent sourceInfo MessageHandler from invalid URL " +
            message.origin
        );
      }
    });
  });

  // onDestroy(() => {
  //     window.removeEventListener("message", false);
  // });

  const sendHighlights = () => {
    if (iFrameLoaded && childWindow && highlights) {
      document.getElementById(fileId).contentWindow.postMessage(
        {
          function: "setHighlights",
          fileId: fileId,
          args: { highlights: highlights },
        },
        CHILD_URL + "/react-pdf-highlighter/?fileId=" + fileId
      );
    }
  };

  const oniFrameLoad = () => {
    iFrameLoaded = true;
    // sendHighlights();
  };

  let highlightsSubscriber = Meteor.subscribe("highlights");
  //load highlights
  $m: {
    if (highlightsSubscriber.ready() && availableHighlightIds) {
      let search = Highlights.findOne({ fileId: fileId });
      if (search && search.highlights) {
        highlights = search.highlights.filter((highlight) =>
          availableHighlightIds.includes(highlight.id)
        );
        highlightIds = highlights.map((highlight) => highlight.id);
      }
    }
    if (iFrameLoaded && document.getElementById(fileId).contentWindow) {
      childWindow = document.getElementById(fileId).contentWindow;
      sendHighlights();
    }
    if (scrollHighlightId) {
      goToHighlight(scrollHighlightId);
    }
  }
</script>

<div class="sourceInfo">
  {#if !fieldObject.body.nA}
    <div class="info">
      <div class="row">
        <div class="column">
          <p>Version {fieldObject.version.number}</p>
          <p>DOI: {fieldObject.body.DOI}</p>
          <p>Title: {fieldObject.body.longTitle}</p>
        </div>
        <div class="column">
          <label for="authors">Authors:</label>
          <ul>
            {#each fieldObject.body.authors as author}
              <li>
                <p>{author}</p>
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
    {#if fieldObject.body.fileId}
      <!-- <button on:click={toggleShow}> Show PDF </button> -->
      {#if showPDF}
        {#if highlightMode}
          <h2 in:fly={{ y: 200, duration: 500 }}>
            Make a New Highlight Below!
          </h2>
        {/if}
        <div class="iframe-container">
          <iframe
            on:load={oniFrameLoad}
            id={fileId}
            src={CHILD_URL + "/react-pdf-highlighter/?fileId=" + fileId}
            title="file"
            frameborder="0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation allow-modals"
          />
        </div>
      {:else}
        <label for="fileId">File ID:</label>
        <p>{fieldObject.body.fileId}</p>
      {/if}
    {/if}
  {:else}
    <p>Version {fieldObject.version.number}</p>
    <p>
      <i>N/A</i>
    </p>
  {/if}
  <p>Author: {fieldObject.authorUsername}</p>
</div>

<style>
  .iframe-container {
    display: flex;
    justify-content: center;
  }
  iframe {
    position: relative;
    width: 100%;
    height: 100vh;
  }
  .row {
    display: flex;
  }

  .column {
    flex: 50%;
    height: 100%;
    overflow: hidden;
    line-height: 2px;
    align-items: center;
    justify-content: center;
  }

  h2 {
    color: red;
    background-color: yellow;
    text-align: center;
    justify-content: center;
    border-radius: 15px;
  }
</style>
