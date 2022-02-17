<script>
  import Navbar from "./App/Navbar";
  import Routes from "./App/Routes";
  import WelcomePage from "./App/WelcomePage";
  import UserLogging from "./App/UserLogging";
  import { Meteor } from "meteor/meteor";
  import { fade } from "svelte/transition";

  let user;

  $m: {
    user = Meteor.user();
  }
</script>

<svelte:head
  ><link
    rel="stylesheet"
    href="https://unpkg.com/carbon-components-svelte@0.58.2/css/g100.css"
  /></svelte:head
>

<!-- DARK-MODE-SWITCH -->
<!-- <button class="dark-mode-switch" onclick="darkmodeswitcher()"
  >Change to Dark Mode
</button> -->

<div class="app-content-wrapper">
  {#if user === undefined}
    <!--If the user has not been set yet, show blank screen -->
    <div />
    >
  {:else if user === null}
    <WelcomePage />
    <UserLogging />
  {:else}
    <Navbar />
    <div
      class="rest-of-content"
      in:fade={{
        delay: 400,
        duration: 200,
      }}
      out:fade={{
        duration: 200,
      }}
    >
      <Routes />
      <!--Load Routes, current route will be displayed here-->
    </div>
  {/if}
  <div>
    <UserLogging />
  </div>
</div>

<style>
  /* .dark-mode-switch {
    background: white;
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 4;
    padding: 20px;
  } */

  .app-content-wrapper {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: row;
    background: #121212;
    flex-wrap: nowrap;
  }
  .rest-of-content {
    display: flex;
    flex-direction: column;
    flex-basis: 100%;
    flex: 1;
    right: 0;
    color: white;
    max-width: calc(100% - 90px);
    margin-left: 90px;

    margin-left: 90px;
  }

  /* .light-mode .alternate-option {
    color: #000000;
  }

  .light-mode .right-signup-container:before {
    display: none;
  }

  .light-mode .right-signup-container:after {
    display: none;
  }
 max-width: calc(100% - 90px) !important;
  .light-mode .signup-message {
    color: #000000;
  }
  .light-mode .left-signup-container {
    background: #ffffff !important;
  } */
</style>
