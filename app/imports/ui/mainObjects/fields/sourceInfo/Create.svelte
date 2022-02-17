<script>
  import { Session } from "meteor/session";
  export let fieldBody;
  export let showFieldName = false;
  export let mandatory;
  const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
  const pdfjsWorker = require("pdfjs-dist/build/pdf.worker.entry");
  const doiRegex = require("doi-regex");

  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  let authorName = "";
  let file;
  let reader = new FileReader();

  //handles file select
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
            result.forEach((r) => {
              console.log(r);
            });
            fieldBody.DOI = result[0];
          });
        },
        function (errorMsg) {
          console.error(errorMsg);
        }
      );
    };
  };

  //uploads file
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
            fieldBody.fileId = newFileId;
            Session.set("info", "upload successful");
          }
        }
      };
    } else {
      Session.set("error", "No file selected");
      throw new Meteor.Error("file-upload-failed", "no file");
    }
  };

  //adds new author to array
  const handleAuthorAdd = () => {
    //check for duplicates
    if (fieldBody.authors.includes(authorName)) {
      Session.set("error", "duplicate author");
      throw new Meteor.Error(
        "dupicate-author",
        "user tried to insert a duplicate author name"
      );
    }

    //I have no idea why, but using a copy is the only way to get the new item to show up instantaneously
    let copy = fieldBody.authors;
    copy.push(authorName);
    fieldBody.authors = copy;

    //reset author name
    authorName = "";
  };

  //removes author from array
  const handleAuthorRemove = (author) => {
    fieldBody.authors = fieldBody.authors.filter(
      (currentAuthor) => currentAuthor !== author
    );
  };
</script>

<div>
  {#if showFieldName}
    <h3>Source Information:</h3>
  {/if}

  {#if !mandatory}
    <label for="N/A"><i>Mark as N/A: </i></label>
    <input type="checkbox" bind:checked={fieldBody.nA} />
    <br />
  {/if}
  {#if !fieldBody.nA}
    <label for="DOI">DOI:</label>
    <input type="text" name="DOI" bind:value={fieldBody.DOI} />

    <label for="long title">Title:</label>
    <input type="text" name="longTitle" bind:value={fieldBody.longTitle} />

    <label for="authors">Authors:</label>
    <ul>
      {#each fieldBody.authors as author}
        <li>
          {author}
          <button on:click={handleAuthorRemove(author)}>Remove</button>
        </li>
      {/each}
    </ul>
    <br />
    <label for="newAuthorName">New Author Name (add one at a time):</label>
    <form on:submit|preventDefault={handleAuthorAdd}>
      <input
        type="text"
        name="newAuthorName"
        placeholder="Type new author name"
        bind:value={authorName}
      />
      <button type="submit">Add</button>
    </form>
    <label for="fileId">File:</label>
    {#if fieldBody.fileId}
      <p>ID: {fieldBody.fileId}</p>
    {/if}
    <input
      type="file"
      accept=".pdf"
      on:change|preventDefault={(event) => onFileSelected(event)}
    />
    <input type="button" value="Upload" on:click={uploadFile} />
  {/if}
</div>

<style>
  label {
    display: block;
  }
</style>
