import { RerenderScheduler } from "./renderer";

export type BaseProps = Record<string, any> & {
  children?: VNode[];
  key?: string | number;
  ref?: Ref<any>;
};

export interface Ref<T = any> {
  current: T | null;
}

export type IntrinsicElementProps<K extends keyof JSX.IntrinsicElements> =
  JSX.IntrinsicElements[K] & BaseProps;

export type Props = BaseProps & Record<string, any>;

export type FunctionComponent<P = Props> = (props: P) => VNode;

export interface VNode<
  T extends keyof JSX.IntrinsicElements | FunctionComponent = any
> {
  type: T extends keyof JSX.IntrinsicElements ? T : FunctionComponent;
  props: T extends keyof JSX.IntrinsicElements
    ? IntrinsicElementProps<T>
    : Props;
  children: VNode[];
  key?: string | number;
}

export type VNodeChild = VNode | undefined;

export interface RefHookData<T = any> {
  current: T | null;
}

export interface StateHookData<T = any> {
  state: T;
  queue: Array<T | ((prev: T) => T)>;
}

export interface EffectHookData {
  effect: () => void | (() => void);
  cleanup: (() => void) | undefined;
  deps: any[] | undefined;
  hasRun: boolean;
}

// Union type for all possible hook data
export type HookData = RefHookData | StateHookData | EffectHookData;

export class ComponentInstance {
  public hooks: HookData[] = [];
  public currentHookIndex: number = 0;
  public component: FunctionComponent;
  public vnode: VNode | null = null;
  public domElement: Element | null = null;

  constructor(component: FunctionComponent) {
    this.component = component;
  }

  resetHookIndex() {
    this.currentHookIndex = 0;
  }
}

export let currentInstance: ComponentInstance | null = null;
export let isRendering = false;

export function setCurrentInstance(instance: ComponentInstance | null) {
  currentInstance = instance;
}

export function setIsRendering(rendering: boolean) {
  isRendering = rendering;
}
