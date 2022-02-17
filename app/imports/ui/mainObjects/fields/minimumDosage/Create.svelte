<script>
  export let fieldBody;
  export let showFieldName = false;
  export let mandatory;
</script>

<div>
  {#if showFieldName}
    <h3>Minimum Dosage:</h3>
  {/if}

  {#if !mandatory}
    <label for="N/A"><i>Mark as N/A: </i></label>
    <input type="checkbox" bind:checked={fieldBody.nA} />
    <br />
  {/if}

  {#if !fieldBody.nA}
    <label for="MinimumDosageAmount">Amount:</label>
    <input
      type="number"
      name="newMinimumDosageAmount"
      bind:value={fieldBody.amount}
    />

    <label for="MinimumDosageUnit">Unit:</label>
    <select bind:value={fieldBody.unit}>
      <option value="kilograms">kilograms</option>
      <option value="grams">grams</option>
      <option value="milligrams">milligrams</option>
      <option value="micrograms">micrograms</option>
      <option value="picograms">picograms</option>
      <option value="cups">cups</option>
      <option value="fluid ounces">fluid ounces</option>
      <option value="cubic centimeters">cubic centimeters</option>
      <option value="moles">moles</option>
      <option value="millimoles">millimoles</option>
      <option value="micromoles">micromoles</option>
    </select>

    <br />
    <label for="MinimumDosageFrequency">Frequency:</label>
    <p>
      <input
        type="number"
        name="newMinimumDosageFrequencyTimes"
        bind:value={fieldBody.frequencyTimes}
      />

      {fieldBody.frequencyTimes == 1 ? "time" : "times"}

      every

      <input
        type="number"
        name="newMinimumDosageFrequencyEvery"
        bind:value={fieldBody.frequencyEvery}
      />

      {#if fieldBody.frequencyEvery == 1}
        <select bind:value={fieldBody.frequencyPeriod}>
          <option value="days">day</option>
          <option value="weeks">week</option>
          <option value="months">month</option>
          <option value="years">year</option>
        </select>
      {:else}
        <select bind:value={fieldBody.frequencyPeriod}>
          <option value="days">days</option>
          <option value="weeks">weeks</option>
          <option value="months">months</option>
          <option value="years">years</option>
        </select>
      {/if}

      for

      <input
        type="number"
        name="newMinimumDosageFrequencyDurationNumber"
        bind:value={fieldBody.frequencyDurationNumber}
      />

      {#if fieldBody.frequencyDurationNumber == 1}
        <select bind:value={fieldBody.frequencyDurationPeriod}>
          <option value="days">day</option>
          <option value="weeks">week</option>
          <option value="months">month</option>
          <option value="years">year</option>
        </select>
      {:else}
        <select bind:value={fieldBody.frequencyDurationPeriod}>
          <option value="days">days</option>
          <option value="weeks">weeks</option>
          <option value="months">months</option>
          <option value="years">years</option>
        </select>
      {/if}
    </p>
  {/if}
</div>
