import type { Component } from "solid-js";

const IconPill: Component<{
  children: any;
  class: string;
}> = (props) => {
  return (
    <div
      class={`w-fit whitespace-nowrap bg-white bg-opacity-20 ${props.class}`}
    >
      {props.children}
    </div>
  );
};

export default IconPill;
