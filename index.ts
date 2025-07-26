// index.ts
import { startRenderer } from "./run-cad";

const filePath = process.argv[2];

startRenderer(filePath, {
  // onJSONUpdate: (json) => console.log("Updated JSON:", json),
  // onTreeUpdate: (tree) => console.log("Updated tree:", tree),
});
