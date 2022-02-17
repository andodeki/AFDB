<script>
  export let fieldBody;
  export let showFieldName = false;
  export let mandatory;
</script>

<div>
  {#if showFieldName}
    <h3>Affected Population:</h3>
  {/if}

  {#if !mandatory}
    <label for="N/A"><i>Mark as N/A: </i></label>
    <input type="checkbox" bind:checked={fieldBody.nA} />
    <br />
  {/if}

  {#if !fieldBody.nA}
    <label for="AffectedPopulationAge">Age:</label>
    <input
      type="number"
      name="newAffectedPopulationAge"
      bind:value={fieldBody.age}
    />

    <label for="AffectedPopulationSex">Sex:</label>
    <select bind:value={fieldBody.sex}>
      <option value="All">All</option>
      <option value="M">M</option>
      <option value="F">F</option>
    </select>

    <label for="AffectedPopulationAttemptingToConceive"
      >Attempting To Conceive:</label
    >
    <select bind:value={fieldBody.attemptingToConceive}>
      <option value={false}>No</option>
      <option value={true}>Yes</option>
    </select>

    <label for="AffectedPopulationPregnant">Pregnant:</label>
    <select bind:value={fieldBody.pregnant}>
      <option value={false}>No</option>
      <option value={true}>Yes</option>
    </select>

    <label for="AffectedPopulationNursing">Nursing:</label>
    <select bind:value={fieldBody.nursing}>
      <option value={false}>No</option>
      <option value={true}>Yes</option>
    </select>
  {/if}
</div>
