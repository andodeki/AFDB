<script>
  //from: https://svelte.dev/tutorial/slot-props
  let hovering;

  function enter() {
    hovering = true;
  }

  function leave() {
    hovering = false;
  }
</script>

<div class="can-be-hovered" on:mouseenter={enter} on:mouseleave={leave}>
  <slot {hovering} />
</div>
