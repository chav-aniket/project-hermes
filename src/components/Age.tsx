import dayjs from "dayjs";
import { createSignal } from "solid-js";

const Age = () => {
  const calcAge = () =>
    dayjs().diff(dayjs("2000/10/01"), "year", true).toFixed(7);

  const [age, setAge] = createSignal(+calcAge());

  setInterval(() => setAge(+calcAge()), 1000);

  return (
    <span
      class="
        rounded-md bg-white bg-opacity-10 py-1
        px-2
    "
    >
      <code>~{age()}</code>
    </span>
  );
};

export default Age;
