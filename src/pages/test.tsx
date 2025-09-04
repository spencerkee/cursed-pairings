import { Select, createOptions } from "@thisbeyond/solid-select";
import { createSignal } from "solid-js";

export default function ReactiveExample() {
    const optionSets = {
        fruit: ["apple", "banana", "pear", "pineapple", "kiwi"],
        starwars: ["jedi", "sith", "stormtrooper", "luke", "leia"],
    };
    const [activeSet, setActiveSet] = createSignal("fruit");

    const [activeOptions, setActiveOptions] = createSignal(optionSets[activeSet()]);

    const props = createOptions(
        activeOptions
    );

    return (
        <Select
            // options={optionSets[activeSet()]}
            onChange={() =>
                // setActiveSet(activeSet() === "fruit" ? "starwars" : "fruit")
                setActiveOptions(optionSets["starwars"])
            }
            {...props}
        />
    );
};