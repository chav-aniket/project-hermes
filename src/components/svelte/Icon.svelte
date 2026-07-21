<script lang="ts">
  import { IconVendor } from "@utils/types";

  export let base: number,
    scale: number,
    style: string,
    viewBox: IconVendor = IconVendor.SimpleIcon,
    customViewBox = "";

  // Responsive sizing done in pure CSS so the icon can render as static SSR
  // markup with no hydration. `clamp()` reproduces the old stepped calcSize()
  // curve (base at ≤640px viewport → base + 4*scale at ≥1280px) as a smooth
  // interpolation. Solving the linear middle term: size(vw) grows by 4*scale
  // over the 640→1280 range, i.e. (base - 4*scale)px + (scale * 0.625)vw.
  const dim = `clamp(${base}px, calc(${base - 4 * scale}px + ${
    scale * 0.625
  }vw), ${base + 4 * scale}px)`;
  const sizeStyle = `width:${dim};height:${dim}`;

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

<svg
  role="img"
  viewBox={viewBoxValue}
  xmlns="http://www.w3.org/2000/svg"
  class={`fill-tertiary-light dark:fill-tertiary-dark ${style}`}
  style={sizeStyle}
>
  <slot />
</svg>
