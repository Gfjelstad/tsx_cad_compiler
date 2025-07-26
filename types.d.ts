import { Ref } from "./global";

// types.d.ts
export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      sketch: {
        plane: "XY" | "YZ" | "ZX" | string;
        ref?: Ref<IntrinsicElements["sketch"]>;
      };
      rectangle: { width: number; height: number; ref?: Ref };
      circle: { radius: number; center?: [number, number]; ref?: Ref };
      // extrude: { height: number; ref?: Ref };
      // union: {}; // no props, just an empty object
      // Add more elements with exact props as you expand
    }
  }
}
