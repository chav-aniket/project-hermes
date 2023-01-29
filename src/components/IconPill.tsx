import type { Component } from "solid-js";

const IconPill: Component<{
  children: any;
  styles: string;
}> = (props) => {
  return (
    <div
      class={`bg-white bg-opacity-20 w-fit whitespace-nowrap ${props.styles}`}
    >
      {props.children}
    </div>
  );
};

export default IconPill;
