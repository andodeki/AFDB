<script>
  import { range } from "lodash";

  export let fieldBody;
  export let showFieldName = false;
  export let mandatory;
  import { onMount } from "svelte";
  import { PARENT_URL } from "/imports/common/consts";

  //state vars
  import {
    availableSources,
    expandedSource,
    newHighlight,
  } from "../../mainObjectShowStores";

  let relatedSourceObjects = [];
  let relatedSourceNames = [];
  availableSources.subscribe((sourceObjects) => {
    relatedSourceObjects = sourceObjects;
    relatedSourceNames = sourceObjects.map(
      (sourceObject) => sourceObject.sourceTitle
    );
  });

  //update availableSources
  if (relatedSourceObjects) {
    fieldBody.availableSources = relatedSourceObjects;
  }

  let editor;
  let editorDiv;

  let newHighlightId = "";
  let currentSelectionId = "";
  let isCurrentSelectionValid = false;

  //wrappedHandleInput wrapped by caret position saving
  const wrappedHandleInput = (location) => {
    if (editor && editor.innerText) {
      //save caret position and text state - https://stackoverflow.com/questions/4576694/saving-and-restoring-caret-position-for-contenteditable-div
      var restore = saveCaretPosition(editorDiv);
      let currentState = editor.innerHTML;

      //process input
      handleInput();

      //restore caret position unless content was changed
      let newState = editor.innerHTML;

      if (currentState === newState) {
        restore();
      }
    }
  };

  const setNewHighlightId = (highlightId) => {
    newHighlightId = highlightId;
    if (editor) {
      //Yes, I know this check is redundant. No, it won't work if you remove it.
      wrappedHandleInput("setNewHighlightId");
    }
    //reset newHighightId and store
    newHighlightId = "";
    newHighlight.set("");
  };

  onMount(() => {
    editor.innerText = fieldBody.text;
    editorDiv = document.getElementById("live-editor");
    editorDiv.addEventListener("input", function (e) {
      //process input
      wrappedHandleInput("input listener");
    });
    document.documentElement.addEventListener("click", function (e) {
      currentSelectionId = window.getSelection().focusNode.parentElement.id;

      if (
        currentSelectionId === "live-editor" ||
        currentSelectionId === "live-editor-link" ||
        currentSelectionId === "feedback-parent-div"
      ) {
        isCurrentSelectionValid = true;
      } else {
        isCurrentSelectionValid = false;
      }
    });
    wrappedHandleInput("onMount");
  });

  newHighlight.subscribe((highlightId) => {
    if (editor) {
      setNewHighlightId(highlightId);
    }
  });

  const makeNewHighlight = (sourceId) => {
    expandedSource.set({ sourceId, highlightMode: true });
  };

  function saveCaretPosition(context) {
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    range.setStart(context, 0);
    var len = range.toString().length;

    return function restore() {
      var pos = getTextNodeAtPosition(context, len);
      selection.removeAllRanges();
      var range = new Range();
      range.setStart(pos.node, pos.position);
      selection.addRange(range);
      return [pos.node, pos.position];
    };
  }

  function getTextNodeAtPosition(root, index) {
    const NODE_TYPE = NodeFilter.SHOW_TEXT;
    var treeWalker = document.createTreeWalker(
      root,
      NODE_TYPE,
      function next(elem) {
        if (index > elem.textContent.length) {
          index -= elem.textContent.length;
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    );
    var c = treeWalker.nextNode();
    return {
      node: c ? c : root,
      position: index,
    };
  }

  const handleInput = () => {
    let text = editor.innerText;
    let formattedText = text;

    if (text.includes("[]")) {
      let subText = text.slice(0, text.indexOf("[]"));
      let reverseText = subText.split("").reverse().join("");
      let slice = reverseText.slice(0, reverseText.indexOf("#"));
      let sourceName = slice.split("").reverse().join("");

      if (sourceName && relatedSourceNames.includes(sourceName)) {
        let sourceId = relatedSourceObjects.filter(
          (source) => source.sourceTitle === sourceName
        )[0].sourceId;
        //prompt user to make new highlight
        if (!newHighlightId) {
          makeNewHighlight(sourceId);
        }

        if (newHighlightId) {
          text = text.replace(
            "#" + sourceName + "[]",
            "#" + sourceName + `[highlight:${newHighlightId}]`
          );
          formattedText = formattedText.replace(
            "#" + sourceName + "[]",
            "#" + sourceName + `[highlight:${newHighlightId}]`
          );
        }
      }
    }

    relatedSourceObjects.forEach((sourceObject) => {
      let sourceId = sourceObject.sourceId;
      let title = sourceObject.sourceTitle;
      let highlightMatch = formattedText.match(/\[(.*?)\]/g);

      if (highlightMatch) {
        highlightMatch.forEach((match) => {
          if (match.startsWith("[highlight:")) {
            let highlightId = match
              .substring(1, match.length - 1)
              .replace("highlight:", "");
            formattedText = formattedText.replaceAll(
              "#" + title + match,
              `<a id="live-editor-link" href="" onclick="(function(){postMessage({function: 'goToHighlight', args: {sourceId: '${sourceId}', highlightId: '${highlightId}'}}, '${PARENT_URL}')})()" title="${title}">` +
                "&#35;" +
                title +
                match +
                "</a>"
            );
          }
        });
      }

      formattedText = formattedText.replaceAll(
        "#" + title,
        `<a id="live-editor-link" href="" onclick="(function(){postMessage({function: 'expandSource', args: {sourceId: '${sourceId}'}}, '${PARENT_URL}')})()" title="${title}">` +
          "&#35;" +
          title +
          "</a>"
      );
    });

    editor.innerHTML = formattedText;
    fieldBody.text = text;

    range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const addSource = (sourceObject) => {
    var selection = window.getSelection();

    if (isCurrentSelectionValid) {
      var range = selection.getRangeAt(0);
      range.setStart(editorDiv, 0);
      var len = range.toString().length;
      var pos = getTextNodeAtPosition(editorDiv, len);
      let node = pos.node;
      if (node.nodeValue) {
        let nodeLen = node.nodeValue.length;
        node.nodeValue =
          node.nodeValue.substring(0, pos.position) +
          "#" +
          sourceObject.sourceTitle +
          node.nodeValue.substring(pos.position, nodeLen);
      } else {
        //empty editor case
        editor.innerText = "#" + sourceObject.sourceTitle;
      }
      wrappedHandleInput("on add source click");
    }
  };
</script>

<div id="feedback-parent-div">
  {#if showFieldName}
    <h3>Feedback Info:</h3>
  {/if}

  {#if !mandatory}
    <label for="N/A"><i>Mark as N/A: </i></label>
    <input type="checkbox" bind:checked={fieldBody.nA} />
    <br />
  {/if}
  {#if !fieldBody.nA}
    <label for="feedbackInfoText">Text:</label>
    <div
      id="live-editor"
      bind:this={editor}
      contenteditable="true"
      role="textbox"
      spellcheck="false"
      style="outline: none; user-select: text; white-space: pre-wrap; overflow-wrap: break-word;"
    />
    {#if relatedSourceObjects && isCurrentSelectionValid}
      <div class="relatedSourcesContainer">
        {#each relatedSourceObjects as sourceObject}
          <button
            class="sourceButton"
            on:click={() => {
              addSource(sourceObject);
            }}>{sourceObject.sourceTitle}</button
          >
        {/each}
      </div>
    {/if}
  {/if}
</div>

<style>
  label {
    display: block;
  }
  .relatedSourcesContainer {
    display: block;
  }

  .sourceButton {
    margin: 5px;
    background-color: #ededed;
    color: #5b9059;
  }

  #live-editor {
    display: inline-block;
    width: 80%;
    aspect-ratio: 1/0.5;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(118, 118, 118);
    border-radius: 2px;
    padding: 5px;
    text-align: left;
  }

  #live-editor:focus {
    border-width: 2px;
    border-color: blue;
  }
</style>
