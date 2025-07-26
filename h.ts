import {
  FunctionComponent,
  IntrinsicElementProps,
  Props,
  VNode,
  VNodeChild,
} from "./global";

function normalizeChildren(children: VNodeChild[]): VNode[] {
  const normalized: VNode[] = [];
  for (const child of children.flat()) {
    if (!child) {
      continue;
    }
    if (typeof child === "object" && "type" in child) {
      // It's already a VNode (created by h() function)
      normalized.push(child);
    }
  }
  return normalized;
}

export function h<K extends keyof JSX.IntrinsicElements>(
  type: K,
  props: IntrinsicElementProps<K> | null,
  ...children: VNodeChild[]
): VNode<K>;

export function h<P extends Props>(
  type: FunctionComponent<P>,
  props: P | null,
  ...children: VNodeChild[]
): VNode;

// Implementation
export function h(
  type: string | FunctionComponent,
  props: any | null,
  ...children: VNodeChild[]
): VNode {
  const { ref, key, ...restProps } = props || {};

  const normalizedChildren = normalizeChildren(children);

  const node: VNode = {
    type,
    props: {
      ...restProps,
      children: normalizedChildren,
      ...(ref && { ref }),
    },
    children: normalizedChildren,
    key,
  };

  return node;
}
