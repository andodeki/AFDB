<script>
  import { getContext } from "svelte";
  import AddSourceModal from "./AddSourceModal";
  import { Meteor } from "meteor/meteor";

  const { open } = getContext("simple-modal");

  const onCancel = () => {};

  //create source
  const createSource = (fileId, doi, bibtex, longTitle, authors) => {
    let fieldNameBodyPairs = [
      {
        name: "sourceInfo",
        body: { nA: false, DOI: doi, longTitle, authors, fileId },
      },
    ];
    Meteor.call(
      "mainObject.insert",
      "sources",
      bibtex,
      fieldNameBodyPairs,
      (error, result) => {
        if (error) {
          if (error.error == "validation-error") {
            Session.set("error", error.reason);
          } else if (error.error == "missing-mandatory-field") {
            Session.set("error", error.reason);
          } else {
            Session.set("error", "Server error, please try again later");
            throw new Meteor.Error(
              "Error while calling mainObject.insert method",
              error
            );
          }
        } else if (result) {
          //do nothing
        }
      }
    );
  };

  const showDialog = () => {
    open(
      AddSourceModal,
      {
        message: "Add Source",
        hasForm: true,
        onCancel,
        createSource,
      },
      {
        closeButton: true,
        closeOnEsc: true,
        closeOnOuterClick: false,
      }
    );
  };
</script>

<section>
  <button on:click={showDialog}>+ Add Source</button>
</section>

<style>
  section {
    padding-top: 0.5em;
  }
</style>
