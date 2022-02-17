<script>
  import { Meteor } from "meteor/meteor";
  import { Session } from "meteor/session";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";

  let username = "";
  let password = "";
  let passwordConfirmation = "";

  //--------------------

  //--------------------

  let signingUp = false;

  const handleLoginSubmit = () => {
    Meteor.loginWithPassword(username, password, function (error) {
      if (error) {
        Session.set("error", error.reason);
      }
    });
  };

  const toggleSignUp = () => {
    //reset error before re-rendering
    isError = false;

    //reset form info before re-rendering
    username = "";
    password = "";
    passwordConfirmation = "";

    //toggle signingUp
    signingUp = !signingUp;
  };

  const handleSignUpSubmit = () => {
    Meteor.call(
      "signUp",
      username,
      password,
      passwordConfirmation,
      (error, result) => {
        if (error) {
          Session.set("error", error.reason);
        }
        if (result) {
          Meteor.loginWithPassword(username, password);
        }
      }
    );
  };

  //Random Image generator
  var imageURLs = [
    "http://www.myserver.com/images/image1.png",
    "http://www.myserver.com/images/image2.png",
    "http://www.myserver.com/images/image3.png",
  ];
  function getImageTag() {
    var img = '<img c;lsrc="';
    var randomIndex = Math.floor(Math.random() * imageURLs.length);
    img += imageURLs[randomIndex];
    img += '" alt="Some alt text"/>';
    return img;
  }

  onMount(async () => {
    showImage();
  });
</script>

<!-- START OF DOM -->
<!-- Full Window Wrap -->

<div class="full-window-wrap">
  <!-- Left container with login/signup forms -->
  <div class="flex-column left-signup-container">
    <!-- logo -->
    <img class="insignia" src="/images/greenlogo.png" alt="Actualfood" />

    {#if !signingUp}
      <!-- Signup Form -->
      <form
        in:fade={{
          delay: 400,
          duration: 200,
        }}
        out:fade={{
          duration: 200,
        }}
        class="login-form"
        on:submit|preventDefault={handleLoginSubmit}
      >
        <!-- Sign Up message -->
        <span class="signup-message"
          >Welcome <span class="green-font">back</span></span
        >
        <span class="signup-submessage">Please enter your details.</span>

        <!-- Username -->
        <div class="fieldholder has-float-label">
          <label for="username" class="label">Username</label>
          <input
            id="username1"
            class="input"
            type="text"
            placeholder="Enter your username"
            name="username"
            required
            bind:value={username}
          />
          <label for="username1">Username</label>
        </div>

        <!-- Password -->
        <div class="fieldholder has-float-label">
          <label for="password" class="label">Password</label>
          <input
            id="password1"
            class="input"
            type="password"
            placeholder="Password"
            name="password"
            required
            bind:value={password}
          />
          <label for="password1">Password</label>
        </div>

        <!-- Sign Up Button -->
        <button class="main-button" type="submit">Sign In</button>

        <!-- Alternate Option -->

        <span class="alternate-option">
          Don't have an account?
          <button
            class="alternate-button green-font"
            on:click|preventDefault={toggleSignUp}>Sign up.</button
          >
        </span>
      </form>

      <!-- Create Account -->
    {:else}
      <!-- Signup Form -->
      <form
        in:fade={{
          delay: 400,
          duration: 200,
        }}
        out:fade={{
          duration: 200,
        }}
        class="login-form"
        on:submit|preventDefault={handleSignUpSubmit}
      >
        <!-- Sign Up message -->
        <span class="signup-message"
          >Sign <span class="green-font">up</span></span
        >
        <span class="signup-submessage">Please enter your details.</span>

        <!-- Username -->
        <div class="fieldholder has-float-label">
          <label for="username" class="label">Username</label>
          <input
            id="username2"
            class="input"
            type="text"
            placeholder="Enter your username"
            name="username"
            required
            bind:value={username}
          />
          <label for="username2">Username</label>
        </div>

        <!-- Password -->
        <div class="fieldholder has-float-label">
          <label for="password" class="label">Password</label>
          <input
            id="password2"
            class="input"
            type="password"
            placeholder="Password"
            name="password"
            required
            bind:value={password}
          />
          <label for="password2">Password</label>
        </div>

        <!--Confirm Password -->
        <div class="fieldholder has-float-label">
          <input
            id="confirmpassword1"
            class="input"
            type="password"
            placeholder="Confirm Password"
            name="confirm-password"
            required
            bind:value={passwordConfirmation}
          />
          <label for="confirmpassword1">Confirm Password</label>
        </div>

        <!-- Sign Up and Log In Button -->
        <button class="main-button" type="submit">Sign Up</button>

        <!-- Alternate Option -->

        <span class="alternate-option">
          Already have an account?
          <button
            class="alternate-button green-font"
            on:click|preventDefault={toggleSignUp}>Sign In.</button
          >
        </span>
      </form>
    {/if}
  </div>
  <div
    class="flex-column right-signup-container"
    in:fade={{
      delay: 400,
      duration: 200,
    }}
    out:fade={{
      duration: 200,
    }}
  />
</div>

<style>
  .full-window-wrap {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
    min-height: 100vh;
  }
  .flex-column {
    display: flex;
    flex-direction: column;
    flex-basis: 100%;
    flex: 1;
  }
  .left-signup-container {
    background: #121212;
    padding: 50px 50px 50px 100px;
    display: flex;
    justify-content: center;
    max-width: 680px;
    min-width: 725px;
  }

  .signup-message {
    display: block;
    padding-bottom: 0;
    color: white;
    font: 500 50px sans-serif;
  }

  .signup-message .green-font {
    font-size: 50px;
  }
  .green-font {
    color: #1ed760;
  }
  .right-signup-container {
    /*background: url("/images/greens.jpg") center / cover;*/
    background-position: center;
    background-size: cover;
  }
  .right-signup-container:after {
    content: "";
    position: fixed;
    background: rgb(18, 18, 18);
    background: linear-gradient(
      90deg,
      rgba(18, 18, 18, 1) 0%,
      rgba(18, 18, 18, 0) 39%,
      rgba(18, 18, 18, 0) 75%
    );
    /*background: rgb(18, 18, 18);*/
    /*background: linear-gradient(90deg, rgba(18, 18, 18, 1) 0%, rgba(18, 18, 18, 0) 30%);*/
    z-index: 2;
    height: 100%;
    width: 100%;
  }

  .right-signup-container:before {
    content: "";
    position: fixed;
    background: rgb(18, 18, 18);
    background: linear-gradient(
      0deg,
      rgba(18, 18, 18, 1) 0%,
      rgba(18, 18, 18, 0) 39%,
      rgba(18, 18, 18, 0) 75%
    );
    /*background: rgb(18, 18, 18);*/
    /*background: linear-gradient(90deg, rgba(18, 18, 18, 1) 0%, rgba(18, 18, 18, 0) 30%);*/
    z-index: 2;
    height: 100%;
    width: 100%;
  }

  .signup-submessage {
    display: block;
    margin-bottom: 8px;
    color: transparent;
    font-size: 20px;
  }
  .label {
    margin-bottom: 5px !important;
    display: none;
    font: 500 medium sans-serif;
  }
  .fieldholder {
    margin-bottom: 30px;
  }
  .main-button:hover {
    transform: scale(1.04);
  }
  .main-button {
    background: #19bd38;
    border: none;
    color: white;
    padding: 20px;
    min-width: 100%;
  }
  .main-button:focus {
    outline-style: auto;
  }
  .alternate-button {
    background: none;
    border: none;
    font-weight: 500;
    padding: 0 4px 2px !important;
    cursor: pointer;
    margin-left: -2px;
  }
  .alternate-button:focus,
  .alternate-button:hover {
    text-decoration: underline;
  }
  .alternate-option {
    display: block;
    position: fixed;
    bottom: 32px;
    /*text-align: center;*/
    color: #ffffff;
    margin-top: 17px;
  }

  .login-form {
    width: 450px;
    display: block;
    position: absolute !important;
    margin-top: 20px;
  }
  .insignia {
    position: absolute;
    top: 35px;
    width: 60px;
    margin-left: -10px;
  }

  .has-float-label {
    display: block;
    position: relative;
  }
  .has-float-label LABEL,
  .has-float-label > SPAN {
    position: absolute;
    left: 11px;
    top: 15px;
    cursor: text;
    color: #1ed760;
    /*font-weight: 500;*/
    font-size: 80%;
    /*background: #121212;*/
    opacity: 1;
    /*transition: all 0.3s ease-in-out;*/
    padding: 0 4px;
    /*-webkit-backdrop-filter: blur(20px);*/
    /*backdrop-filter:blur(20px);*/
  }
  .has-float-label SELECT {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
  .input:not(:placeholder-shown) {
    border-color: rgba(30, 214, 96, 0.4);
    color: #1ed760;
  }
  .has-float-label INPUT,
  .has-float-label SELECT {
    display: block;
    padding: 38px 10px 12px 15px;
    /*border-radius: 5px;*/
    background: transparent;
    width: 100%;
    border: 1px solid #2f3336;
  }
  .input:hover:placeholder-shown {
    border-color: rgba(255, 255, 255, 0.7);
    background: transparent;
  }
  .input {
    color: white;
    /*transition: all 200ms !important;*/
    outline: none !important;
  }
  .input:focus,
  .input:focus:placeholder-shown {
    border: 1px solid #19bd38 !important;
    color: #19bd38;
    /*background: rgba(25, 188, 56, 0.121);*/
    cursor: text;
    outline: none !important;
  }
  INPUT:focus {
    /*background: rgba(25, 188, 56, 0.1);*/
    border: 1px solid rgba(25, 188, 56, 0.263) !important;
  }
  .input:hover {
    cursor: pointer;
    background: rgba(25, 188, 56, 0.082);
  }
  .input:focus::placeholder {
    color: rgba(30, 214, 96, 0.35);
  }
  .has-float-label INPUT::placeholder,
  .has-float-label SELECT::placeholder {
    opacity: 1;
    transition: all 0.2s;
  }
  .has-float-label INPUT:placeholder-shown:not(:focus)::placeholder,
  .has-float-label SELECT:placeholder-shown:not(:focus)::placeholder {
    opacity: 0;
  }
  .has-float-label INPUT:placeholder-shown:not(:focus) + *,
  .has-float-label SELECT:placeholder-shown:not(:focus) + * {
    font-size: 120%;
    font-weight: 300;
    color: rgba(255, 255, 255, 0.457);
    background: transparent;
    -webkit-backdrop-filter: blur(0px);
    backdrop-filter: blur(0px);
    top: 1.15em;
    padding-left: 10px;
  }
  .has-float-label:hover INPUT:placeholder-shown:not(:focus) + *,
  .has-float-label:hover SELECT:placeholder-shown:not(:focus) + * {
    color: white;
  }
  .has-float-label SELECT {
    padding-right: 1em;
    background: url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23333' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E")
      no-repeat right 0.5em bottom 0.25em;
    background-size: 8px 10px;
  }
</style>
