<script lang="ts">
  import { calcSize } from "../../utils/resizing";
  export let base: number, scale: number, style: string, viewBox: string = "0 0 24 24", fill: string = "#ffffff";
  let size = calcSize(base, scale);
  const handleResize = () => size = calcSize(base, scale);
</script>

<svelte:window on:resize={() => handleResize()} />
  <svg
  role="img"
  viewBox={viewBox}
  xmlns="http://www.w3.org/2000/svg"
  class={style}
  width={size}
  height={size}
  fill={fill}
>
  <slot />
</svg>
