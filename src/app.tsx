import { createOptions, fuzzySearch, Select } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";
import { createEffect, createSignal, For, Show } from "solid-js";
import jsonData from './resources/data.json' with { type: 'json' };

function createDataObj() {
  let dataObj = new Map();
  // TODO Handle failures gracefully
  let characters = jsonData["characters"];
  for (let item of characters) {
    let data = {
      degree: item.d,
      pairings: item.p
    }
    dataObj.set(item.n, data);
  }
  return dataObj;
}

export default function Home() {
  const [selectedChar, setSelectedChar] = createSignal(null);
  const [selectedPartners, setSelectedPartners] = createSignal([]);

  let DATA_OBJ = createDataObj();

  const optionSets = {
    full: Array.from(DATA_OBJ.keys()),
    initial: Array.from(DATA_OBJ.keys()).slice(0, 10),
  };
  const [activeSet, setActiveSet] = createSignal("initial");

  createEffect(() => {
    console.log('selectedChar', selectedChar());
    if (selectedChar()) {
      let partners = DATA_OBJ.get(selectedChar()).pairings;
      setSelectedPartners(partners);
    } else {
      setSelectedPartners([]);
    }
  });
  createEffect(() => {
    console.log('activeSet', activeSet());
    // setActiveOptions(optionSets[activeSet()]);
  });


  const customFuzzySort = (searchString, options, valueFields) => {
    // TODO This is hit multiple times for some reason
    console.log("searchString", searchString);
    const sorted = [];

    for (let index = 0; index < options.length; index++) {
      const option = options[index];
      const fieldResults = valueFields.reduce(
        (map, target) => {
          return map.set(target, fuzzySearch(searchString, option.value))
        },
        new Map(),
      );

      let score = 0;
      for (const [, result] of fieldResults) score += result.score;
      if (score) sorted.push({ score, option, index, fieldResults });
    }
    sorted.sort((a, b) => b.score - a.score || a.index - b.index);
    return sorted.slice(0, 10);
  };

  const filterable = (inputValue, options) =>
    customFuzzySort(inputValue, options, ["n"]).map(
      (result) => ({
        ...result.option,
      }),
    );

  const props = createOptions(
    () => optionSets[activeSet()],
    { filterable }
  );
  return (
    <>
      <h3 class="text-2xl">Find fanfiction character's pairings (least cursed first)</h3>
      <Select
        onChange={(obj) => {
          console.log('onChange', obj);
          setSelectedChar(obj);
        }}
        onInput={(obj) => {
          console.log('onInput start', obj);
          if (obj) {
            console.log('onInput full');
            setActiveSet("full");
          } else {
            setActiveSet("initial");
            console.log('onInput initial');
          }
        }}
        class="m-4 w-96"
        {...props}
      />
      <Show
        when={selectedPartners()?.length > 0}
      // fallback={<div class="mt-4">No partners selected</div>}
      >
        <h4 class="text-lg">{selectedChar()} has been paired with:</h4>
        <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100 lg:w-3/5 md:w-full " >
          <table class="table table-zebra">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Times Paired</th>
                <th>Similarity</th>
                <th>Most Common Fandom</th>
              </tr>
            </thead>
            <tbody>
              <For each={selectedPartners()}>
                {(pairing, i) =>
                  <tr>
                    <th>{i() + 1}</th>
                    <td>{pairing.n}</td>
                    <td>{pairing.w}</td>
                    <td>{pairing.s}</td>
                    <td>{pairing.f}</td>
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
