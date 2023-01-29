import { SiGithub, SiLinkedin } from "solid-icons/si";
import { FaSolidLocationDot } from "solid-icons/fa";

import { IconPill } from "./components";

const Nav = () => {
  const styles = "pr-4 py-0";
  const size = 25;
  return (
    <nav class="flex flex-row items-center">
      <span class={styles}>
        <a target="_blank" href="https://www.github.com/chav-aniket">
          <SiGithub size={size} />
        </a>
      </span>
      <span class={styles}>
        <a target="_blank" href="https://www.linkedin.com/in/chavaniket/">
          <SiLinkedin size={size} />
        </a>
      </span>
      <span class={styles}>
        <IconPill styles="rounded-full pr-1 pt-0.5">
          <FaSolidLocationDot
            class="inline m-1 p-2 align-middle"
            size={size + 15}
          />
          <span class="pr-4">Sydney, Australia</span>
        </IconPill>
      </span>
    </nav>
  );
};

export default Nav;
