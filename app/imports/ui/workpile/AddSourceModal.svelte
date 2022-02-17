<script>
  import { Session } from "meteor/session";

  import { getContext } from "svelte";

  export let message;
  export let hasForm = false;
  export let onCancel = () => {};
  export let createSource = () => {};

  const { close } = getContext("simple-modal");
  const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
  const pdfjsWorker = require("pdfjs-dist/build/pdf.worker.entry");
  const doiRegex = require("doi-regex");

  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  let file;
  let fileId;
  let reader = new FileReader();

  let doi = "";
  let bibtex = "";
  let longTitle = "";
  let bibtexAuthor = "";
  let newdoi = "";
  let authors = [];
  let editingAuthors = false;
  let newAuthor = "";
  let year = NaN;

  const toggleEditAuthors = () => {
    editingAuthors = !editingAuthors;
  };

  const removeAuthor = (author) => {
    authors = authors.filter((currentAuthor) => currentAuthor !== author);
  };

  const addAuthor = () => {
    authors = [...authors, newAuthor];
    newAuthor = "";
  };
  function _onCancel() {
    onCancel();
    close();
  }

  function addSource() {
    validate();
    generateBibtex();
    uploadFile();
  }

  const validate = () => {
    if (!doi) {
      Session.set("error", "Missing DOI");
      throw new Meteor.Error(
        "missing-doi",
        "user tried to submit new source with no doi"
      );
    }

    if (!year) {
      Session.set("error", "Missing Publication Year");
      throw new Meteor.Error(
        "missing-year",
        "user tried to submit new source with no publication year"
      );
    }

    if (authors.length === 0) {
      Session.set("error", "Missing Authors");
      throw new Meteor.Error(
        "missing-authors",
        "user tried to submit new source with no authors"
      );
    }
  };

  const generateBibtex = () => {
    if (authors.length === 1) {
      bibtexAuthor = authors[0].split(" ").pop();
    } else if (authors.length === 2) {
      bibtexAuthor =
        authors[0].split(" ").pop() + " & " + authors[1].split(" ").pop();
    } else {
      bibtexAuthor = authors[0].split(" ").pop() + " et al.";
    }
    bibtex = bibtexAuthor + " " + year;
  };

  const setdoi = () => {
    if (newdoi) {
      doi = newdoi;
      getInfo();
    }
  };

  const resetInfo = () => {
    authors = "";
    bibtex = "";
    longTitle = "";
    year = "";
  };

  const populateInfo = (info) => {
    if (info.author) {
      info.author.forEach((currentAuthor) => {
        authors = [
          ...authors,
          currentAuthor.given + " " + currentAuthor.family,
        ];
      });
    }
    if (info["published-print"]["date-parts"][0].length > 0) {
      year = info["published-print"]["date-parts"][0][0];
    }
    if (info.title[0]) {
      longTitle = info.title[0];
    }
  };

  const getInfo = () => {
    var url = `https://api.crossref.org/works/${doi}/`;

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        resetInfo();
        if (xhr.status == 200) {
          populateInfo(JSON.parse(xhr.responseText).message);
        }
      }
    };

    xhr.send();
  };

  const onFileSelected = (event) => {
    file = event.target.files[0];
    reader.readAsArrayBuffer(file);
    reader.onload = function () {
      const loading = pdfjsLib.getDocument(reader.result);
      loading.promise.then(
        (pdf) => {
          let countPromises = [];
          let maxPages = pdf.numPages;
          let allTxt = "";

          for (var j = 1; j <= maxPages; j++) {
            var page = pdf.getPage(j);

            var txt = "";
            countPromises.push(
              page.then(function (page) {
                // add page promise
                var textContent = page.getTextContent();
                return textContent.then(function (page) {
                  // return content promise

                  for (var i = 0; i < page.items.length; i++) {
                    txtadd = page.items[i].str;
                    txt += txtadd;
                    // txtadd.replace(/[^a-zA-Z0-9:;,.?!-() ]/g,'');
                  }
                  return txt;
                });
              })
            );
          }

          Promise.all(countPromises).then((txt) => {
            txt.forEach((t) => {
              allTxt += t;
            });
            result = allTxt.match(doiRegex());
            if (result) {
              result.forEach((r) => {
                console.log(r);
              });
              newdoi = result[0].replace(/[^0-9]+?$/, ""); //strip trailing chars;
            } else {
              newdoi = "";
            }
          });
        },
        function (errorMsg) {
          console.error(errorMsg);
        }
      );
    };
  };

  const uploadFile = () => {
    if (file) {
      if (!(file.type === "application/pdf")) {
        Session.set("error", "File must be in PDF format");
        throw new Meteor.Error(
          "file-upload-failed",
          "invalid file format: " + file.type
        );
      }
      let xhr = new XMLHttpRequest();
      xhr.open("POST", "/uploadFile", true);
      xhr.send(file);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == XMLHttpRequest.DONE) {
          newFileId = xhr.responseText;

          //if file not uploaded succesfully, delete source object
          if (!newFileId) {
            Session.set("error", "Error on file upload, please try again");
            throw new Meteor.Error(
              "file-upload-failed",
              "no fileId in server response"
            );
          }
          //if upload successful, upload fileId
          else {
            fileId = newFileId;
            Session.set("info", "upload successful");
            createSource(fileId, doi, bibtex, longTitle, authors);
            close();
          }
        }
      };
    } else {
      Session.set("error", "No file selected");
      throw new Meteor.Error("file-upload-failed", "no file");
    }
  };

  // $: onChange(value);
</script>

<h2>{message}</h2>

{#if hasForm}
  <div>
    <input
      type="file"
      accept=".pdf"
      on:change|preventDefault={(event) => onFileSelected(event)}
    />
  </div>

  {#if file}
    <div class="doi-field">
      <label for="DOI">Please enter or confirm DOI:</label>
      <input class="file-select" type="text" name="DOI" bind:value={newdoi} />
      {#if newdoi}
        <button on:click={setdoi}>Set DOI</button>
      {/if}
    </div>

    {#if doi}
      <div>
        <p><b>DOI:</b> {doi}</p>
      </div>

      <div>
        <p>
          <b>Title:</b>
          <input
            type="text"
            name="title"
            placeholder="Enter title"
            bind:value={longTitle}
          />
        </p>
      </div>

      <div>
        <label for="authors"
          ><b>Authors:</b>
          <button on:click={toggleEditAuthors}
            >{editingAuthors ? "Submit" : "Edit"}</button
          >
        </label>
        {#if editingAuthors}
          <form on:submit|preventDefault={addAuthor}>
            <input
              type="text"
              name="newAuthor"
              placeholder="First Name followed by Family Name"
              bind:value={newAuthor}
            />
            <button type="submit">Add</button>
          </form>
        {/if}
        <ul>
          {#each authors as author}
            <li>
              {author}
              {#if editingAuthors}
                <button on:click={removeAuthor(author)}>X</button>
              {/if}
            </li>
          {/each}
        </ul>
      </div>

      <div>
        <p>
          <b>Publication Year:</b>
          <input
            type="number"
            name="publication year"
            placeholder="Year of publication"
            bind:value={year}
          />
        </p>
      </div>

      <div class="buttons">
        <button on:click={addSource}> Add Source </button>
      </div>
    {/if}
  {/if}
{/if}

<style>
  h2 {
    font-size: 2rem;
    text-align: center;
  }

  .file-select {
    width: 100%;
  }

  .buttons {
    display: flex;
    justify-content: center;
    margin: 1em;
  }

  .doi-field {
    margin: 1em;
  }

  button {
    background-color: green !important;
  }
</style>
