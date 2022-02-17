<script>
  import { onMount } from "svelte";
  import { router } from "tinro";
  // let url = window.location.pathname;

  // Parallax Code
  onMount(async () => {
    var scene = document.getElementById("scene");
    var parallax = new Parallax(scene);
  });
</script>

<div class="no-page-found">
  <section class="wrapper">
    <div class="container container1">
      <div id="scene" class="scene" data-hover-only="false">
        <div class="one" data-depth="0.9">
          <div class="content">
            <span class="piece" />
            <span class="piece" />
            <span class="piece" />
          </div>
        </div>
        <div class="two" data-depth="0.60">
          <div class="content">
            <span class="piece" />
            <span class="piece" />
            <span class="piece" />
          </div>
        </div>
        <div class="three" data-depth="0.40">
          <div class="content">
            <span class="piece" />
            <span class="piece" />
            <span class="piece" />
          </div>
        </div>
        <div class="p404 firs404" data-depth="0.50">404</div>
        <div class="p404 seco404" data-depth="0.10">404</div>
      </div>
    </div>
    <div class="container container2">
      <div class="text">
        <div class="info-hold">
          <p>
            The link you are looking for does not exist
            <!-- <br />Go back to the homepage if you
            dare! -->
          </p>
          <button
            on:click={() => {
              router.goto("/");
            }}>GO HOME</button
          >
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .wrapper .container .one,
  .wrapper .container .two,
  .wrapper .container .three,
  .wrapper .container .p404 {
    width: 60% !important;
    height: 60% !important;
    top: 20% !important;
    left: 20% !important;
    min-width: 400px !important;
    min-height: 400px !important;
  }

  .p404 {
    margin: -57px 0 0 -27px;
    padding: 0;
    list-style: none;
    border: 0;
    -webkit-tap-highlight-color: transparent;
    text-decoration: none;
    font-size: 150px;
    font-weight: 700;
    letter-spacing: 4px;
    /*-webkit-text-stroke-width: 3px;*/
    -webkit-text-stroke-color: rgba(255, 255, 255, 0.8);
    color: #c4c4c4;
    display: flex !important;
    justify-content: center;
    align-items: center;
    /*animation: text 0.6s ease 0.8s backwards;*/
    animation-delay: 1.2s;
    position: absolute;
  }
  .seco404 {
    order: 2;
    color: rgba(255, 255, 255, 0.5);
    z-index: 1;
    display: none !important;
    animation-delay: 1s;
    filter: blur(10px);
    opacity: 0.8;
    z-index: -1;
    text-shadow: 0 0 20px #121212;
    animation: text 0.6s cubic-bezier(0.3, 0.8, 1, 1.05) both;
  }
  .wrapper {
    display: flex;
    position: relative;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }
  .container1 {
    transition: all 0.4s ease;
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    position: relative;
    margin-left: -50px;
  }

  .container2 {
    position: absolute !important;
    transition: all 0.4s ease;
    display: flex;
    width: 100%;
    background: rgba(18, 18, 18, 0);
    height: 100%;
    /*display: none !important;*/
    justify-content: center;
    /*display: none !important;*/
    align-items: center;
    margin-left: -50px;
  }
  .no-page-found {
    height: 100%;
    width: 100%;
    display: block;
    position: relative;
  }
  .wrapper .container .scene {
    /*position: absolute;*/
    position: absolute;
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    /*width: 500px;*/
    /*height: 500px;*/
  }
  .wrapper .container .one .content,
  .wrapper .container .two .content,
  .wrapper .container .three .content {
    min-width: 600px;
    /*background: yellow;*/
    min-height: 900px;
    position: absolute;
    opacity: 0.2;
    /*display: none !important;*/
    z-index: -4 !important;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) !important;
    /*animation: content 0.8s cubic-bezier(1, 0.06, 0.25, 1) backwards;*/
    margin-top: -100px;
    margin-left: -100px;
  }
  @keyframes content {
    0% {
      width: 0;
    }
  }
  @-webkit-keyframes content {
    0% {
      width: 0;
    }
  }
  .wrapper .container .one .content .piece,
  .wrapper .container .two .content .piece,
  .wrapper .container .three .content .piece,
  .wrapper .container .p404 .content .piece {
    width: 600px;
    height: 80px;
    display: flex;
    position: absolute;
    border-radius: 80px;
    z-index: 1;
    animation: pieceLeft 8s cubic-bezier(1, 0.06, 0.25, 1) infinite both;
    /*margin-top: 100px;*/
    margin-left: 144px;
    margin-top: 55px;
  }
  @keyframes pieceLeft {
    50% {
      left: 80%;
      width: 10%;
    }
  }
  @keyframes pieceRight {
    50% {
      right: 80%;
      width: 10%;
    }
  }
  @-webkit-keyframes pieceLeft {
    50% {
      left: 80%;
      width: 10%;
    }
  }
  @-webkit-keyframes pieceRight {
    50% {
      right: 80%;
      width: 10%;
    }
  }

  @media screen and (max-height: 660px) {
    .wrapper .container .one,
    .wrapper .container .two,
    .wrapper .container .three,
    .wrapper .container .p404 {
      min-width: 280px;
      min-height: 280px;
      width: 60%;
      height: 60%;
      top: 20% !important;
      left: 20% !important;
    }
  }
  .wrapper .container .text {
    /*animation: text 0.6s 1.8s ease backwards;*/
    position: relative;
    margin-top: 200px;
  }
  @keyframes text {
    0% {
      opacity: 0;
      margin-top: 240px;
    }
  }
  @-webkit-keyframes text {
    0% {
      opacity: 0;
      margin-top: 240px;
    }
  }
  @media screen and (max-width: 799px) {
    .wrapper .container .text {
      min-height: 400px;
      height: 80%;
    }
  }
  .info-hold {
    bottom: 0;
    z-index: 4;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  @media screen and (max-width: 799px) {
    .info-hold {
      width: 100%;
    }
  }
  .info-hold P {
    color: #c4c4c4;
    font-size: 30px;
    text-shadow: 0 0 10px #181818;
  }
  .info-hold BUTTON {
    padding: 10px 30px;
    border-radius: 50px;
    cursor: pointer;
    z-index: 3;
    color: black;
    letter-spacing: 1px;
    background-color: #29c961;
    text-transform: uppercase;
    font-weight: 600;
    font-size: 20px;
    transition: all 0.3s ease;
    border: none !important;
    margin-top: 24px;
  }
  .info-hold BUTTON:hover {
    transform: scale(1.04);
  }
  @media screen and (max-width: 799px) {
    .wrapper .container .p404 {
      font-size: 100px;
    }
  }
  @keyframes anime404 {
    0% {
      opacity: 0;
      transform: scale(10) skew(20deg, 20deg);
    }
  }
  @-webkit-keyframes anime404 {
    0% {
      opacity: 0;
      transform: scale(10) skew(20deg, 20deg);
    }
  }
  .wrapper .container .p404:nth-of-type(2) {
    color: #1db954;
    z-index: 1;
    animation-delay: 1s;
    filter: blur(10px);
    opacity: 0.8;
  }
  .wrapper .container .one .content:before {
    content: "";
    position: absolute;
    width: 600px;
    height: 600px;
    opacity: 0;
    background-color: #11481b;
    border-radius: 100%;
    box-shadow: inset 5px 20px 40px rgba(24, 79, 45, 0.25),
      inset 5px 0px 5px rgba(36, 62, 47, 0.3),
      inset 5px 5px 20px rgba(36, 62, 47, 0.25),
      2px 2px 5px rgba(255, 255, 255, 0.2);
    animation: circle 0.8s 0.4s cubic-bezier(1, 0.06, 0.25, 1) backwards;
  }
  @media screen and (max-width: 799px) {
    .wrapper .container .one .content:before {
      width: 300px;
      height: 300px;
    }
  }
  .wrapper .container .one .content .piece {
    background: rgba(49, 155, 119, 0.371);
  }
  .wrapper .container .one .content .piece:nth-child(1) {
    right: 15%;
    top: 18%;
    height: 30px;
    width: 120px;
    animation-delay: 0.5s;
    animation-name: pieceRight;
  }
  .wrapper .container .one .content .piece:nth-child(2) {
    left: 15%;
    top: 45%;
    width: 150px;
    height: 50px;
    animation-delay: 1s;
    animation-name: pieceLeft;
  }
  .wrapper .container .one .content .piece:nth-child(3) {
    left: 10%;
    top: 75%;
    height: 20px;
    width: 70px;
    animation-delay: 1.5s;
    animation-name: pieceLeft;
  }
  .wrapper .container .two .content .piece {
    background: rgba(30, 214, 96, 0.655);
  }
  .wrapper .container .two .content .piece:nth-child(1) {
    left: 0%;
    top: 25%;
    height: 40px;
    width: 120px;
    animation-delay: 2s;
    animation-name: pieceLeft;
  }
  .wrapper .container .two .content .piece:nth-child(2) {
    right: 15%;
    top: 35%;
    width: 180px;
    height: 50px;
    animation-delay: 2.5s;
    animation-name: pieceRight;
  }
  .wrapper .container .two .content .piece:nth-child(3) {
    right: 10%;
    top: 80%;
    height: 20px;
    width: 160px;
    animation-delay: 3s;
    animation-name: pieceRight;
  }
  .wrapper .container .three .content .piece {
    background: #343434;
  }
  .wrapper .container .three .content .piece:nth-child(1) {
    left: 25%;
    top: 35%;
    height: 20px;
    width: 80px;
    animation-name: pieceLeft;
    animation-delay: 3.5s;
  }
  .wrapper .container .three .content .piece:nth-child(2) {
    right: 10%;
    top: 55%;
    width: 140px;
    height: 40px;
    animation-name: pieceRight;
    animation-delay: 4s;
  }
  .wrapper .container .three .content .piece:nth-child(3) {
    left: 40%;
    top: 68%;
    height: 20px;
    width: 80px;
    animation-name: pieceLeft;
    animation-delay: 4.5s;
  }
</style>
