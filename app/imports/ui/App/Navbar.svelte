<script>
  import { fade } from "svelte/transition";
  const logout = () => {
    Meteor.logout();
  };
</script>

<nav
  in:fade={{
    delay: 400,
    duration: 200,
  }}
  out:fade={{
    duration: 200,
  }}
>
  <!-- <h1>Actionable Findings Database</h1> -->
  <a class="logo-wrap" href="/">
    <img class="small-logo" src="/images/greenlogo.png" alt="Actualfood" />
  </a>

  <div class="rest-of-nav">
    <a
      href="/actionable-findings/index"
      class="menu-icon-wrap search-tag menu-item"
    >
      <img class="menu-icon" src="/svg/search.svg" alt="Actionable Finding" />
    </a>

    <a href="/debunked-myths/index" class="menu-icon-wrap wand-tag menu-item">
      <img class="menu-icon" src="/svg/wand.svg" alt="Debunked Myths" />
    </a>

    <a href="/dietary-items/index" class="menu-icon-wrap food-tag menu-item">
      <img class="menu-icon" src="/svg/food.svg" alt="Dietary items" />
    </a>

    <a
      href="/health-conditions/index"
      class="menu-icon-wrap health-tag menu-item"
    >
      <img class="menu-icon" src="/svg/health.svg" alt="Health Conditions" />
    </a>

    <a href="/sources/index" class="menu-icon-wrap book-tag menu-item">
      <img class="menu-icon" src="/svg/book.svg" alt="Sources" />
    </a>
  </div>

  <!-- <p id="user" href="/sources/index">
        Welcome {user.username}!
       
    </p> -->
  <button class="logout-button logout-tag menu-item" on:click={logout}>
    <img class="menu-icon" src="/svg/logout.svg" alt="Sources" />
  </button>
</nav>

<style>
  NAV {
    display: flex;
    flex-direction: column;
    z-index: 1;
    align-content: center;
    justify-content: center;
    flex-wrap: wrap;
    height: 100vh;
    width: 90px;
    background: #121212;
    /*background: #000000;*/
    /*box-shadow: -7px 0px 30px rgba(0, 0, 0, 0.478);*/
    padding-top: 25px;
    padding-bottom: 20px;
    /*padding-left: 10px;*/
    /*padding-right: 10px;*/
    position: fixed;
    top: 0px;
    padding-left: 5px;
    /*display: none !important;*/
    padding-right: 5px;
    /*border-right: 1px solid #242424;*/
  }
  .rest-of-nav {
    margin-top: auto;
    margin-bottom: auto;
    padding-top: 20px;
  }
  .menu-icon {
    opacity: 0.3;
    width: 25px;
    height: auto;
    display: block;
    filter: brightness(0) invert(1);
    transition: all 200ms ease-in-out !important;
    /*margin-left: 5px;*/
    margin-left: -6px;
  }
  .menu-item:hover .menu-icon {
    opacity: 1;
  }
  .small-logo {
    width: 45px;
    height: auto;
    display: block;
    /*border-radius: 100px;*/
    margin-top: 9px;
    /*filter: brightness(0) invert(1);*/
    margin-bottom: 1px;
    margin-left: -5px;
    padding-bottom: 27px;
    /*border-bottom: 2px solid rgba(0, 0, 0, 0.341);*/
  }
  .menu-item {
    display: flex;
    width: 100%;
    height: 80px;
    overflow: hidden;
    justify-content: center;
    padding-top: 10px;
    padding-bottom: 10px;
    transition: all 0.2s;
    /*transition: 0.2s ease-in-out;*/
    padding: 0;
    /*border: 1px solid rgba(255, 255, 255, 0);*/
    /*border-right: 5px solid transparent;*/
    border-radius: 100px;
    /*margin-bottom: 7.5px;*/
    margin-top: 7.5px;
    outline: none !important;
    /*margin-left: 1px;*/
  }
  .menu-item:before {
    /*content: "";*/
    position: absolute;
    /*height: 30px;*/
    box-shadow: 12px 9px 10px 4px rgba(0, 0, 0, 0.195);
    width: auto;
    white-space: nowrap;
    display: block;
    font-size: 18px;
    /*align-items: center;*/
    color: #dfdfdf;
    backdrop-filter: brightness(60%) blur(20px);
    background: rgba(156, 156, 156, 0.147);
    border-radius: 10px;
    left: 76px;
    margin-top: 20px;
    opacity: 0;
    visibility: hidden;
    padding: 7px 15px;
    letter-spacing: 0.5px;
    /*transition: opacity 3s ease-in-out, visibility;*/
    transition: all 200ms ease-in-out !important;
  }
  .menu-item:hover:before {
    opacity: 1;
    visibility: visible;
  }
  .search-tag:before {
    content: "Actionable Findings";
  }
  .wand-tag:before {
    content: "Debunked Myths";
  }
  .food-tag:before {
    content: "Dietary Items";
  }
  .health-tag:before {
    content: "Health Conditions";
  }
  .book-tag:before {
    content: "Sources";
  }
  .logout-tag:before {
    content: "Sign Out";
    font-weight: 500;
    /*background: #000000 !important;*/
    color: white;
    margin-top: 0;
    color: #dfdfdf;
    backdrop-filter: brightness(60%) blur(20px);
    background: #802323;
  }
  .logout-button {
    margin-top: auto !important;
    background: none;
    border: none;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 0;
  }
  .logo-wrap {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-bottom: 16px;
    outline: none !important;
  }
</style>
