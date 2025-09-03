import { createOptions, Select } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";
import { createEffect, createSignal, For, Show } from "solid-js";
import jsonData from '../resources/data.json' with { type: 'json' };

function createDataObj() {
  let dataObj = new Map();
  // TODO Handle failures gracefully
  let characters = jsonData["characters"];
  for (let item of characters) {
    let [name, data] = item;
    dataObj.set(name, data);
  }
  return dataObj;
}

export default function Home() {
  const [selectedChar, setSelectedChar] = createSignal(null);
  const [selectedPartners, setSelectedPartners] = createSignal([]);

  createEffect(() => {
    console.log('selectedChar', selectedChar());
  });

  let DATA_OBJ = createDataObj();

  createEffect(() => {
    if (selectedChar()) {
      let partners = DATA_OBJ.get(selectedChar()).pairings;
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
        when={selectedPartners()?.length > 0}
      // fallback={<div class="mt-4">No partners selected</div>}
      >
        <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
          <table class="table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Similarity</th>
              </tr>
            </thead>
            <tbody>
              <For each={selectedPartners()}>
                {(pairing, i) =>
                  <tr>
                    <th>{i() + 1}</th>
                    <td>{pairing[0]}</td>
                    <td>{pairing[1]}</td>
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
