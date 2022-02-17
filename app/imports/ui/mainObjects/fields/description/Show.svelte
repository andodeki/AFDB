<script>
  export let fieldObject;
</script>

<div>
  <p>Version {fieldObject.version.number}</p>
  {#if !fieldObject.body.nA}
    <p>{fieldObject.body.text}</p>
  {:else}
    <p>
      <i>N/A</i>
    </p>
  {/if}
  <p>Author: {fieldObject.authorUsername}</p>
</div>
