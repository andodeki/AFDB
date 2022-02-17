<script>
  export let noteObject; //object contains note and action strings
</script>

<div>
  <h4>Add a Note to this {noteObject.action} (optional)</h4>
  <textarea
    name="newFieldVersionNote"
    rows="5"
    cols="30"
    bind:value={noteObject.note}
  />
  <br />
</div>
