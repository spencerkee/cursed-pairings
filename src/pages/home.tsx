import { Select, createOptions } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";
import { createSignal } from 'solid-js';

export default function Home() {
  const props = createOptions(["apple", "banana", "pear", "pineapple", "kiwi"]);
    return <Select {...props} />;
}
