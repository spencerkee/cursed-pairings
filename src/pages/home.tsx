import { createOptions, Select } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";
import { createEffect, createSignal, For, Show } from "solid-js";

export default function Home() {
  const [selectedChar, setSelectedChar] = createSignal(null);
  const [selectedPartners, setSelectedPartners] = createSignal([]);

  createEffect(() => {
    console.log('selectedChar', selectedChar());
  });

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
      <Show
        when={selectedPartners().length > 0}
      // fallback={<div class="mt-4">No partners selected</div>}
      >
        <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
          <table class="table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
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
      </Show>

    </>
  )
}
