<script>
  import { Session } from "meteor/session";
  let errorMessage;
  let infoMessage;
  let timeout = 5000; //5 seconds timeout for message to display

  Session.setDefault("error", "");
  Session.setDefault("info", "");

  $m: {
    errorMessage = Session.get("error");
    infoMessage = Session.get("info");

    //clear client-side error and warning messages after 4 seconds
    if (errorMessage) {
      alert("Error - " + errorMessage);
      setTimeout(function () {
        Session.set("error", "");
      }, timeout);
    }

    if (infoMessage) {
      alert("Info - " + infoMessage);
      setTimeout(function () {
        Session.set("info", "");
      }, timeout);
    }
  }

  //functions to trigger error and warning- use for testing purposes
  // const setError = () => {
  //     Session.set('error','error!');
  // }
  // const setWarning = () => {
  //     Session.set('warning', 'warning!');
  // }
</script>

<div>
  <!--buttons to trigger error and warning - use for testing purposes-->
  <!-- <button on:click={setError}>Click me to set an error</button>
    <button on:click={setWarning}>Click me to set a warning</button> -->

  {#if infoMessage}
    <!-- <p class="info">Info - {infoMessage}</p> -->
  {/if}

  {#if errorMessage}
    <!-- <p class="error">Error - {errorMessage}</p> -->
  {/if}
</div>

<style>
  /* .error {
    color: red;
    text-align: center;
  }

  .info {
    color: blue;
    text-align: center;
  } */
</style>
