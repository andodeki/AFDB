<script>
  export let fieldObject;
  import { ToDecimalPrecision } from "/imports/common/methods";
</script>

<div>
  <p>Version {fieldObject.version.number}</p>
  {#if !fieldObject.body.nA}
    <p>
      {ToDecimalPrecision(fieldObject.body.amount, 3)}
      {fieldObject.body.unit}
    </p>
    <p>Conversions:</p>
    <ul>
      {#each fieldObject.body.conversions as conversion}
        <li>{conversion}</li>
      {/each}
    </ul>
    <p>Frequency:</p>
    <p>
      {fieldObject.body.frequencyTimes}
      {fieldObject.body.frequencyTimes == 1 ? "time" : "times"} every {fieldObject
        .body.frequencyEvery}
      {fieldObject.body.frequencyEvery == 1
        ? fieldObject.body.frequencyPeriod.slice(0, -1)
        : fieldObject.body.frequencyPeriod} for {fieldObject.body
        .frequencyDurationNumber}
      {fieldObject.body.frequencyDurationNumber == 1
        ? fieldObject.body.frequencyDurationPeriod.slice(0, -1)
        : fieldObject.body.frequencyDurationPeriod}
    </p>
  {:else}
    <p>
      <i>N/A</i>
    </p>
  {/if}
  <p>Author: {fieldObject.authorUsername}</p>
</div>
