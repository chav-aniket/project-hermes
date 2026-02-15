import type { Component, JSX } from "solid-js";

const IconPill: Component<{
  children: JSX.Element;
  class: string;
}> = (props) => {
  return (
    <div
      class={`w-fit whitespace-nowrap bg-secondary-light dark:bg-secondary-dark${props.class}`}
    >
      {props.children}
    </div>
  );
};

export default IconPill;
