<script lang="ts">
import { calcSize } from "@utils/resizing";
import { IconVendor } from "@utils/types";

export let base: number,
  scale: number,
  style: string,
  viewBox: IconVendor = IconVendor.SimpleIcon,
  customViewBox = "";
let size = calcSize(base, scale);
const handleResize = () => {
  size = calcSize(base, scale);
};

let viewBoxValue = "";
switch (viewBox) {
  case IconVendor.SimpleIcon:
    viewBoxValue = "0 0 24 24";
    break;
  case IconVendor.FontAwesome:
    viewBoxValue = "0 0 390 512";
    break;
  default:
    viewBoxValue = customViewBox;
    break;
}
</script>

<svelte:window on:resize={() => handleResize()} />
<svg
  role="img"
  viewBox={viewBoxValue}
  xmlns="http://www.w3.org/2000/svg"
  class={`fill-tertiary-light dark:fill-tertiary-dark ${style}`}
  width={size}
  height={size}
>
  <slot />
</svg>
