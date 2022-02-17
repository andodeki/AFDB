<script>
  export let fieldBody;
  export let showFieldName = false;
  export let mandatory;
</script>

<div>
  {#if showFieldName}
    <h3>Nutritional Information:</h3>
  {/if}

  {#if !mandatory}
    <label for="N/A"><i>Mark as N/A: </i></label>
    <input type="checkbox" bind:checked={fieldBody.nA} />
    <br />
  {/if}
  {#if !fieldBody.nA}
    <label for="NutritionalInfoCategory">Category:</label>
    <select bind:value={fieldBody.category}>
      <option value="Micronutrient">Micronutrient</option>
      <option value="Macronutrient">Macronutrient</option>
      <option value="Cooked Food">Cooked Food</option>
      <option value="Raw Ingredient">Raw Ingredient</option>
      <option value="Dietary Pattern">Dietary Pattern</option>
    </select>

    <label for="NutritionalInfoDetails">Details:</label>
    <textarea name="NutritionalInfoDetails" bind:value={fieldBody.details} />
  {/if}
</div>

<style>
  label {
    display: block;
  }
</style>
