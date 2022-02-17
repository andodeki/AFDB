<script>
  export let fieldObject;

  import { Capitalize } from "/imports/common/methods";
  import { availableSources } from "../../mainObjectShowStores";
  import { afterUpdate } from "svelte";
  import { PARENT_URL } from "/imports/common/consts";
  import { fieldNameDict } from "/imports/common/dicts";

  //state vars
  let relatedSourceObjects = [];

  availableSources.subscribe((sourceObjects) => {
    relatedSourceObjects = sourceObjects;
  });

  $: formattedText = fieldObject.body.text;

  const formatText = () => {
    relatedSourceObjects.forEach((sourceObject) => {
      let sourceId = sourceObject.sourceId;
      let sourceTitle = sourceObject.sourceTitle;

      let highlightMatch = formattedText.match(/\[(.*?)\]/g);

      if (highlightMatch) {
        highlightMatch.forEach((match) => {
          if (match.startsWith("[highlight:")) {
            let highlightId = match
              .substring(1, match.length - 1)
              .replace("highlight:", "");
            formattedText = formattedText.replaceAll(
              "#" + sourceTitle + match,
              `<a href="" onclick="(function(){postMessage({function: 'goToHighlight', args: {sourceId: '${sourceId}', highlightId: '${highlightId}'}}, '${PARENT_URL}')})()" sourceTitle="${sourceTitle}">` +
                "&#35;" +
                sourceTitle +
                "</a>"
            );
          }
        });
      }

      formattedText = formattedText.replaceAll(
        "#" + sourceTitle,
        `<a href="#" onclick="(function(){postMessage({function: 'expandSource', args: {sourceId: '${sourceId}'}}, '${PARENT_URL}')})()" sourceTitle="${sourceTitle}">` +
          "&#35;" +
          sourceTitle +
          "</a>"
      );
    });
  };

  afterUpdate(() => {
    formatText();
  });
</script>

<div>
  {#if !fieldObject.body.nA}
    <h4 class="subtype">{Capitalize(fieldObject.body.subtype)}</h4>
    <p>
      <i>
        {fieldObject.targetType === "feedback"
          ? "Replying to"
          : fieldObject.body.subtype === "comment"
          ? "Commenting on"
          : "Citing"}
        {fieldObject.body.targetType === "field"
          ? fieldNameDict[fieldObject.body.targetName]
          : fieldObject.body.targetName}
        {fieldObject.body.targetVersion
          ? "version " + fieldObject.body.targetVersion
          : ""}
      </i>
    </p>
    <p>{@html formattedText}</p>
  {:else}
    <p>
      <i>N/A</i>
    </p>
  {/if}
  <p>Author: {fieldObject.authorUsername}</p>
  <!-- <p>Version {fieldObject.version.number}</p> -->
</div>

<style>
  .subtype {
    text-align: center;
  }
</style>
