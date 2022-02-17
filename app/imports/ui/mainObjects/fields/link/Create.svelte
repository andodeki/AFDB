<script>
  export let fieldBody;
  export let showFieldName = false;
  export let mandatory;
  let possibleLinks = [
    "Prevents",
    "Helps Manage",
    "Reverses",
    "Causes",
    "Worsens",
  ];
</script>

<div>
  {#if showFieldName}
    <h3>Link:</h3>
  {/if}

  {#if !mandatory}
    <label for="N/A"><i>Mark as N/A: </i></label>
    <input type="checkbox" bind:checked={fieldBody.nA} />
    <br />
  {/if}
  {#if !fieldBody.nA}
    <select bind:value={fieldBody.link}>
      {#each possibleLinks as link}
        <option value={link}>{link}</option>
      {/each}
    </select>
  {/if}
</div>

<style>
  label {
    display: block;
  }
</style>
