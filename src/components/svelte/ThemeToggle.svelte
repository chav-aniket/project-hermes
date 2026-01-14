<script>
  import { isDarkTheme, toggleTheme } from "@utils/theme";
  // Theme is initialized in Layout.astro before hydration - we just need
  // to sync the checkbox state with the current theme
  let isDark = isDarkTheme();
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
    class="peer h-0 w-0 opacity-0"
    bind:checked={isDark}
    on:change={toggleTheme}
  />
  <span
    class="
            slider absolute before:absolute
            before:bg-white cursor-pointer
            peer-checked:bg-gray-700 peer-checked:before:bg-gray-700
            bottom-0 left-0 right-0 top-0
            rounded-full before:rounded-full
            sm:bg-secondary-light dark:sm:bg-secondary-dark
            duration-500 before:duration-500
            outline outline-2 outline-offset-2
            outline-secondary-light dark:outline-secondary-dark
            sm:before:bottom-1 sm:before:left-1 sm:before:top-1
            before:h-4 before:w-4 sm:before:h-7 sm:before:w-7
            sm:peer-checked:before:translate-x-[2.6rem]
        "
  />
</label>

<style>
  .slider:before {
    content: "";
    background: linear-gradient(40deg, #ff0080, #ff8c00 70%);
  }

  input:checked + .slider:before {
    /* TODO: Need to find out why @apply doesn't work here */
    background: #475569;
    box-shadow:
      inset -3px -2px 5px -2px #8983f7,
      inset -10px -4px 0 0 #a3dafb;
  }
</style>
