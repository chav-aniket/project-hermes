import { createSignal, onCleanup } from "solid-js";

const Age = () => {
  // Not my real birthday you got pranked
  const BIRTH = Date.parse("2000-10-01");
  // Average Gregorian year in ms (365.2425 days) — matches dayjs' fractional
  // year diff without pulling the whole date library into the client bundle.
  const MS_PER_YEAR = 365.2425 * 24 * 60 * 60 * 1000;
  const calcAge = () => ((Date.now() - BIRTH) / MS_PER_YEAR).toFixed(7);

  const [age, setAge] = createSignal(+calcAge());

  const timer = setInterval(() => setAge(+calcAge()), 1000);
  onCleanup(() => clearInterval(timer));

  return (
    <span class="rounded-md bg-secondary-light px-2 py-1 dark:bg-secondary-dark">
      <code>~{age()}</code>
    </span>
  );
};

export default Age;
