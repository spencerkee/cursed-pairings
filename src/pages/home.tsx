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

  const props = createOptions(Array.from(DATA_OBJ.keys()));
  return (
    <>
      <Select {...props} onChange={(obj) => setSelectedChar(obj)} />
      <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table class="table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              {/* <th>Job</th>
              <th>Favorite Color</th> */}
            </tr>
          </thead>
          <tbody>
            <For each={selectedPartners()}>
              {(partner, i) =>
                <tr>
                  <th>{i() + 1}</th>
                  <td>{partner}</td>
                </tr>
              }
            </For>
          </tbody>
        </table>
      </div>
    </>
  )
  // onChange={(e) => console.log(e)}
}
