import { Select, createOptions } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";

export default function Home() {
  const handleSelect = (obj) => {
    console.log(obj);
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
  return (
    <>
      <Select {...props} onChange={handleSelect} />
      {/* <button class="btn">Button</button> */}
      <div class="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
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
      </div>
    </>
  )
  // onChange={(e) => console.log(e)}
}
