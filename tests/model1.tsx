/** @jsx h */
import { useEffect, useRef, useState } from "../dsl-runtime";
import { h } from "../h";

// example.tsx

const Test = () => {
  //
  return (
    <sketch plane={"Byeeee"}>
      <rectangle width={100} height={50} />
      <circle radius={25} />
    </sketch>
  );
};

export function MyModel() {
  const ref = useRef<any>(null);
  const [state, _state] = useState(1);

  useEffect(() => {
    console.log("REF: ", ref);
    if (state < 3) {
      setTimeout(() => {
        _state((prev) => prev + 1);
      }, 1000);
    }
  }, [state]);

  return <sketch ref={ref} plane={`${state}`}></sketch>;
}

export default function Main() {
  return <MyModel />;
}
