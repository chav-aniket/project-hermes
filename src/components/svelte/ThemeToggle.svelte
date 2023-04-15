<script>
    import { isDarkTheme, toggleTheme } from "@utils/theme";
    let isDark = isDarkTheme();
</script>

<label
    class="
        switch
        relative inline-block w-20 h-9
        "
    >
    <input
        type="checkbox"
        class="peer opacity-0 w-0 h-0"
        bind:checked={isDark}
        on:change={toggleTheme}
    >
    <span
        class="
            slider
            absolute bg-secondary-light dark:bg-secondary-dark before:bg-white
            cursor-pointer top-0 left-0 right-0 bottom-0
            duration-500 before:duration-500
            before:absolute before:w-7 before:h-7
            before:left-1 before:bottom-1 before:top-1
            rounded-full before:rounded-full
            peer-checked:bg-gray-700 peer-checked:before:translate-x-[2.6rem]
            peer-checked:before:bg-gray-700
            outline outline-2 outline-offset-2 
            outline-secondary-light dark:outline-secondary-dark
        "
    ></span>
</label>

<style>
    .slider:before {
        content: "";
        background: linear-gradient(40deg, #ff0080, #ff8c00 70%);
    }

    input:checked + .slider:before {
        /* Need to find out why @apply doesn't work here */
        background: #475569;
        box-shadow: inset -3px -2px 5px -2px #8983f7,inset -10px -4px 0 0 #a3dafb;
    }
</style>

