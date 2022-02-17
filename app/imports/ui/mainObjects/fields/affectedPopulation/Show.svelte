<script>
  export let fieldObject;
  import { BooleanToText } from "/imports/common/methods";
</script>

<div>
  <p>Version {fieldObject.version.number}</p>
  {#if !fieldObject.body.nA}
    <ul>
      <li>Age: {fieldObject.body.age}</li>
      <li>Sex: {fieldObject.body.sex}</li>
      <li>
        Attempting To Conceive: {BooleanToText(
          fieldObject.body.attemptingToConceive
        )}
      </li>
      <li>Pregnant: {BooleanToText(fieldObject.body.pregnant)}</li>
      <li>Nursing: {BooleanToText(fieldObject.body.nursing)}</li>
    </ul>
  {:else}
    <p>
      <i>N/A</i>
    </p>
  {/if}
  <p>Author: {fieldObject.authorUsername}</p>
</div>
