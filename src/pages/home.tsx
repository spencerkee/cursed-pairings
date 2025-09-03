import { createOptions, Select } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";
import { createEffect, createSignal, For } from "solid-js";

export default function Home() {
  const [selectedChar, setSelectedChar] = createSignal(null);
  const [selectedPartners, setSelectedPartners] = createSignal([]);

  createEffect(() => {
    console.log('selectedChar', selectedChar());
  });

  // const handleSelect = (obj) => {
  //   console.log(obj);
  // }

  let DATA_OBJ = new Map([
    ["apple", { partners: ["banana", "pear"] }],
    ["banana", { partners: ["apple", "kiwi"] }],
    ["pear", { partners: ["apple", "pineapple"] }],
    ["pineapple", { partners: ["pear"] }],
    ["kiwi", { partners: ["banana"] }],
  ]);

  createEffect(() => {
    if (selectedChar()) {
      let partners = DATA_OBJ.get(selectedChar()).partners;
      setSelectedPartners(partners);
    } else {
      setSelectedPartners([]);
    }
  });

  // debugger;
  const props = createOptions(Array.from(DATA_OBJ.keys()));
  return (
    <>
      <Select {...props} onChange={(obj) => setSelectedChar(obj)} />
      <For each={selectedPartners()}>
        {(item) => <div>{item}</div>}
      </For>
      {/* <button class="btn">Button</button> */}
      {/* <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table class="table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Job</th>
              <th>Favorite Color</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>1</th>
              <td>Cy Ganderton</td>
              <td>Quality Control Specialist</td>
              <td>Blue</td>
            </tr>
          </tbody>
        </table>
      </div> */}
    </>
  )
  // onChange={(e) => console.log(e)}
}
