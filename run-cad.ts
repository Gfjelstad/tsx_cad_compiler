import { pathToFileURL } from "url";
import { h } from "./h";
import { render, RenderedNode } from "./renderer";
import path from "path";
import { FunctionComponent } from "./global";

// Your existing function, but now we know what it returns
export async function compileTSX(filePath: string): Promise<any> {
  const fileUrl = pathToFileURL(path.resolve(filePath)).href;
  const module = await import(fileUrl);
  const exported = module.default;

  return typeof exported === "function" ? exported : exported;
}

// Simple callback types
export interface RenderCallbacks {
  onTreeUpdate?: (tree: any) => void;
  onJSONUpdate?: (json: string) => void;
}

export async function startRenderer(
  filePath: string,
  callbacks: RenderCallbacks = {}
) {
  const component = await compileTSX(filePath);

  if (typeof component !== "function") {
    throw new Error(
      `Expected default export to be a function component, got ${typeof component}`
    );
  }

  const vnode = h(component as FunctionComponent, {});
  const { initialTree, renderer } = render(vnode, {});

  if (callbacks.onTreeUpdate || callbacks.onJSONUpdate) {
    renderer.onTreeUpdate((newTree) => {
      if (callbacks.onTreeUpdate) {
        callbacks.onTreeUpdate(newTree);
      }
      if (callbacks.onJSONUpdate) {
        callbacks.onJSONUpdate(JSON.stringify(newTree, null, 2));
      }
    });
  }

  if (callbacks.onTreeUpdate) {
    callbacks.onTreeUpdate(initialTree);
  }
  if (callbacks.onJSONUpdate) {
    callbacks.onJSONUpdate(JSON.stringify(initialTree, null, 2));
  }

  return {
    stop: () => {
      console.log("Renderer stopped");
    },
  };
}
