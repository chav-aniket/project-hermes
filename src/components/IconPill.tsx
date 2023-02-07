import type { Component } from "solid-js";

const IconPill: Component<{
  children: any;
  styles: string;
}> = (props) => {
  return (
    <div
      class={`w-fit whitespace-nowrap bg-white bg-opacity-20 ${props.styles}`}
    >
      {props.children}
    </div>
  );
};

export default IconPill;
