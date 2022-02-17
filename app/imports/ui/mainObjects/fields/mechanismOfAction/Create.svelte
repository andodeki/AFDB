<script>
  export let fieldBody;
  export let showFieldName = false;
  export let mandatory;
</script>

<div>
  {#if showFieldName}
    <h3>Mechanism of Action:</h3>
  {/if}

  {#if !mandatory}
    <label for="N/A"><i>Mark as N/A: </i></label>
    <input type="checkbox" bind:checked={fieldBody.nA} />
    <br />
  {/if}
  {#if !fieldBody.nA}
    <label for="MechanismOfActionText">Text:</label>
    <textarea name="MechanismOfActionText" bind:value={fieldBody.text} />
  {/if}
</div>

<style>
  label {
    display: block;
  }
</style>
