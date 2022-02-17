<script>
  import { fade } from "svelte/transition";
</script>

<div class="home-content placeholder-class-delete-this">
  <div class="placetext">
    <div class="otherwrapper">
      <div class="animation-wrap">
        <div class="firstword">home</div>
        <div class="secondword">page</div>
      </div>
    </div>
  </div>
</div>

<style>
  .placeholder-class-delete-this {
    height: 100%;
    width: 100%;
    /*background: rgba(0, 0, 0, 0.103);*/
    background: url("/images/greens.jpg") center / cover #121212;
  }

  .otherwrapper {
    height: 100%;
    width: 100%;
    text-align: right;
    display: flex;
    color: white;
    /*background: rgb(0, 0, 0);*/
    /*background: linear-gradient(0deg, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.19979866946778713) 52%, rgba(0, 0, 0, 0) 100%);*/
    font-weight: 600;
    font-size: 52px !important;
    background: rgb(0, 0, 0);
    background: linear-gradient(
      90deg,
      rgba(18, 18, 18, 1) 0%,
      rgba(18, 18, 18, 1) 0%,
      rgba(18, 18, 18, 0.2) 30%,
      rgba(18, 18, 18, 0) 41%,
      rgba(18, 18, 18, 0) 100%
    );
    justify-content: flex-end;
    align-items: flex-end;
    /*border-left: 1px solid rgba(94, 94, 94, 0.414);*/
  }
  .otherwrapper DIV {
    font-size: 179px;
    letter-spacing: -17px;
    display: inline;
    /*margin-bottom: -93px;*/
    /*margin-right: -22px;*/
    opacity: 0.7;
  }

  .placetext .secondword {
    color: #181818;
    -webkit-text-stroke: 1.5px white;
    opacity: 0.5;
    letter-spacing: -12px;
    /*-webkit-text-fill-color: white;*/
    margin-right: 50px;
  }

  .placetext {
    height: 100%;
    width: 100%;
    display: block;
    background: linear-gradient(
      0deg,
      rgba(18, 18, 18, 1) 0%,
      rgba(18, 18, 18, 0.2) 70%
    );
    /*border-left: 1px solid #202020;*/
  }
</style>
