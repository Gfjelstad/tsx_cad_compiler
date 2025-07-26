import {
  ComponentInstance,
  FunctionComponent,
  setCurrentInstance,
  VNode,
} from "./global";

// const componentInstances = new WeakMap<FunctionComponent, ComponentInstance>();

export interface RenderedNode {
  type: string;
  props: Record<string, any>;
  children: RenderedNode[];
  element?: any;
}

export class RerenderScheduler {
  private pendingComponents = new Set<ComponentInstance>();
  private isScheduled = false;
  private renderer: Renderer | null = null;

  setRenderer(renderer: Renderer) {
    this.renderer = renderer;
  }

  scheduleRerender(instance: ComponentInstance) {
    this.pendingComponents.add(instance);

    if (!this.isScheduled) {
      this.isScheduled = true;

      setTimeout(() => this.flushWork(), 0); // batching
    }
  }

  private flushWork() {
    this.pendingComponents.clear();
    this.isScheduled = false;

    if (this.renderer) {
      this.renderer.forceUpdate();
    } else {
      console.error("Scheduler: no renderer available");
    }
  }

  //   private rerenderComponents(instance: ComponentInstance) {
  //     setCurrentInstance(instance);
  //     instance.resetHookIndex();

  //     try {
  //       const newVNode = instance.component(instance.vnode?.props || {});

  //       const oldVNode = instance.vnode;
  //       instance.vnode = newVNode;
  //     } finally {
  //       setCurrentInstance(null);
  //     }
  //   }
}
export const scheduler = new RerenderScheduler();
export class Renderer {
  private container: any;
  private rootInstance: ComponentInstance | null = null;
  private componentInstances = new WeakMap<
    FunctionComponent,
    ComponentInstance
  >();
  private currentRenderedTree: RenderedNode | null = null;
  private updateCallbacks: ((tree: RenderedNode) => void)[] = [];

  constructor(container: any) {
    this.container = container;
  }

  onTreeUpdate(callback: (tree: RenderedNode) => void) {
    this.updateCallbacks.push(callback);
  }

  private emitTreeUpdate(tree: RenderedNode) {
    this.updateCallbacks.forEach((callback) => {
      try {
        callback(tree);
      } catch (error) {
        console.error("Error in tree update callback:", error);
      }
    });
  }

  render(vnode: VNode): RenderedNode {
    const rendered = this.renderVNode(vnode);
    this.currentRenderedTree = rendered;
    return rendered;
  }

  private renderVNode(vnode: VNode): RenderedNode {
    // Handle function components
    if (typeof vnode.type === "function") {
      return this.renderFunctionComponent(vnode);
    }

    // Handle intrinsic elements (sketch, rectangle, circle, etc.)
    return this.renderIntrinsicElement(vnode);
  }

  private renderFunctionComponent(vnode: VNode): RenderedNode {
    const component = vnode.type as FunctionComponent;

    let instance = this.componentInstances.get(component);
    if (!instance) {
      instance = new ComponentInstance(component);
      this.componentInstances.set(component, instance);

      if (!this.rootInstance) {
        this.rootInstance = instance;
      }
    }

    setCurrentInstance(instance);
    instance.resetHookIndex();

    try {
      const result = component(vnode.props || {});
      instance.vnode = result;

      return this.renderVNode(result);
    } finally {
      setCurrentInstance(null);
    }
  }

  private renderIntrinsicElement(vnode: VNode): RenderedNode {
    const { ref, children, ...restProps } = vnode.props || {};

    const rendered: RenderedNode = {
      type: vnode.type,
      props: restProps,
      children: [],
    };

    if (ref) {
      ref.current = rendered; // For now, assign the rendered node
      // In a real CAD system, you'd assign the actual CAD object here
    }

    if (children && Array.isArray(children)) {
      rendered.children = children.map((child) => this.renderVNode(child));
    }

    return rendered;
  }

  mount(vnode: VNode): RenderedNode {
    const rendered = this.render(vnode);

    // In a real system, you'd add to your CAD scene here
    console.log("Mounted to container:", this.container);

    return rendered;
  }

  getCurrentTree(): RenderedNode | null {
    return this.currentRenderedTree;
  }

  getRootInstance(): ComponentInstance | null {
    return this.rootInstance;
  }

  forceUpdate(): RenderedNode | null {
    if (!this.rootInstance || !this.rootInstance.vnode) {
      return null;
    }

    const newTree = this.render(this.rootInstance.vnode);

    this.emitTreeUpdate(newTree);

    return newTree;
  }
}
export function render(
  vnode: VNode,
  container: any
): {
  initialTree: RenderedNode;
  getTree: () => RenderedNode | null;
  renderer: Renderer;
} {
  const renderer = new Renderer(container);

  // Connect scheduler to renderer
  scheduler.setRenderer(renderer);

  const initialTree = renderer.mount(vnode);

  return {
    initialTree,
    getTree: () => renderer.getCurrentTree(),
    renderer,
  };
}
