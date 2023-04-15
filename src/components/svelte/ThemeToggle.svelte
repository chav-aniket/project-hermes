<script>
  import { isDarkTheme, toggleTheme } from "@utils/theme";
  if (isDarkTheme()) {
    localStorage.setItem('theme', 'dark');
    document.documentElement.classList.add('dark');
  } else {
    localStorage.setItem('theme', 'light');
  }
  let isDark = isDarkTheme();
</script>

<label
  class="
        switch
        relative inline-block h-9 w-9 sm:w-20
        "
>
  <input
    type="checkbox"
    class="peer h-0 w-0 opacity-0"
    bind:checked={isDark}
    on:change={toggleTheme}
  />
  <!-- prettier-ignore -->
  <span
    class="
            slider
            before:bg-white peer-checked:bg-gray-700 peer-checked:before:bg-gray-700 absolute
            bottom-0 left-0 right-0 top-0 cursor-pointer
            rounded-full bg-secondary-light
            outline outline-2 outline-offset-2
            outline-secondary-light duration-500 before:absolute
            before:bottom-1 before:left-1
            before:top-1 before:h-7
            before:w-7
            before:rounded-full before:duration-500 dark:bg-secondary-dark
            dark:outline-secondary-dark sm:peer-checked:before:translate-x-[2.6rem]
        "
  />
</label>

<style>
  .slider:before {
    content: "";
    background: linear-gradient(40deg, #ff0080, #ff8c00 70%);
  }

  input:checked + .slider:before {
    /* Need to find out why @apply doesn't work here */
    background: #475569;
    box-shadow: inset -3px -2px 5px -2px #8983f7, inset -10px -4px 0 0 #a3dafb;
  }
</style>
