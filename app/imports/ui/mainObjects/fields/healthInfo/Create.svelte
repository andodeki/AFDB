<script>
  export let fieldBody;
  export let showFieldName = false;
  export let mandatory;
</script>

<div>
  {#if showFieldName}
    <h3>Health Information:</h3>
  {/if}

  {#if !mandatory}
    <label for="N/A"><i>Mark as N/A: </i></label>
    <input type="checkbox" bind:checked={fieldBody.nA} />
    <br />
  {/if}
  {#if !fieldBody.nA}
    <label for="HealthInfoCategory">Category:</label>
    <select bind:value={fieldBody.category}>
      <option value="Category 1">Category 1</option>
      <option value="Category 2">Category 2</option>
      <option value="Category 3">Category 3</option>
    </select>

    <label for="HealthInfoDetails">Details:</label>
    <textarea name="HealthInfoDetails" bind:value={fieldBody.details} />
  {/if}
</div>

<style>
  label {
    display: block;
  }
</style>
