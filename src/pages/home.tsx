import { Select, createOptions } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";

export default function Home() {
  const handleSelect = (e) => {
    console.log(e);
  }

  const props = createOptions(
    [
      { name: "apple", pairs: [1, 2, 3] },
      { name: "banana", pairs: [1, 2, 3] },
      { name: "pear", pairs: [1, 2, 3] },
      { name: "pineapple", pairs: [1, 2, 3] },
      { name: "kiwi", pairs: [1, 2, 3] },
    ],
    { key: "name" }
  );
  return <Select {...props} onChange={handleSelect} />;
  // onChange={(e) => console.log(e)}
}
