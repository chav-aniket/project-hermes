import dayjs from "dayjs";
import { createSignal } from "solid-js";

const Age = () => {
  // Not my real birthday you got pranked
  const calcAge = () =>
    dayjs().diff(dayjs("2000/10/01"), "year", true).toFixed(7);

  const [age, setAge] = createSignal(+calcAge());

  setInterval(() => setAge(+calcAge()), 1000);

  return (
    <span class="rounded-md bg-secondary-light px-2 py-1 dark:bg-secondary-dark">
      <code>~{age()}</code>
    </span>
  );
};

export default Age;
