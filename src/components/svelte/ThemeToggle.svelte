<script lang="ts">
import { toggleTheme } from "@utils/theme";

const handleClick = (e: Event) => {
	e.preventDefault();
	toggleTheme();
};
</script>

<label
  data-theme-toggle
  class="
        switch
        relative inline-block h-4 w-4 sm:h-9 sm:w-20
        "
>
  <input
    type="checkbox"
    class="h-0 w-0 opacity-0"
    on:click={handleClick}
    aria-label="Toggle dark mode"
  />
  <span
    class="
            slider absolute before:absolute
            before:bg-white cursor-pointer
            dark:bg-gray-700 dark:before:bg-gray-700
            bottom-0 left-0 right-0 top-0
            rounded-full before:rounded-full
            sm:bg-secondary-light dark:sm:bg-secondary-dark
            duration-[var(--arc-duration)] before:duration-[var(--arc-duration)]
            outline outline-2 outline-offset-2
            outline-secondary-light dark:outline-secondary-dark
            sm:before:bottom-1 sm:before:left-1 sm:before:top-1
            before:h-4 before:w-4 sm:before:h-7 sm:before:w-7
            sm:dark:before:translate-x-[2.6rem]
        "
  />
</label>

<style>
  .slider:before {
    content: "";
    background: linear-gradient(40deg, #ff0080, #ff8c00 70%);
  }

  /* Moon: slate-600 background with crescent glow effect */
  :global(.dark) .slider:before {
    background: theme(colors.secondary.dark);
    box-shadow:
      inset -3px -2px 5px -2px #8983f7,
      inset -10px -4px 0 0 #a3dafb;
  }
</style>
