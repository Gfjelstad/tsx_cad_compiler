import {
  currentInstance,
  EffectHookData,
  Ref,
  RefHookData,
  StateHookData,
} from "./global";
import { scheduler } from "./renderer";

// Hook for creating refs
export function useRef<T = any>(initialValue: T | null = null): Ref<T> {
  // Ensure we're inside a component render
  if (!currentInstance) {
    throw new Error("useRef must be called inside a function component");
  }

  const instance = currentInstance;
  const hookIndex = instance.currentHookIndex++;

  // Get existing hook or create new one
  let hook = instance.hooks[hookIndex] as RefHookData<T> | undefined;
  if (!hook) {
    // First time this hook is called - create the ref object
    hook = { current: initialValue };
    instance.hooks[hookIndex] = hook;
  }

  return hook as Ref<T>;
}

export function useState<T>(
  initialValue: T | (() => T)
): [T, (newValue: T | ((prev: T) => T)) => void] {
  if (!currentInstance) {
    throw new Error("useRef must be called inside a function component");
  }

  const instance = currentInstance;
  const hookIndex = instance.currentHookIndex++;

  let hook = instance.hooks[hookIndex] as StateHookData<T> | undefined;
  if (!hook) {
    const value =
      typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue;
    hook = {
      state: value,
      queue: [] as Array<T | ((prev: T) => T)>,
    };
    instance.hooks[hookIndex] = hook;
  }
  while (hook.queue.length > 0) {
    const update = hook.queue.shift()!;
    hook.state =
      typeof update === "function"
        ? (update as (prev: T) => T)(hook.state)
        : update;
  }

  const setState = (newValue: T | ((prev: T) => T)) => {
    const hookData = instance.hooks[hookIndex] as StateHookData<T>;
    hookData.queue.push(newValue);
    scheduler.scheduleRerender(instance);
  };

  return [hook.state, setState];
}

export function useEffect(effect: () => void, deps?: any[]): void {
  if (!currentInstance) {
    throw new Error("useRef must be called inside a function component");
  }

  const instance = currentInstance;
  const hookIndex = instance.currentHookIndex++;

  let hook = instance.hooks[hookIndex] as EffectHookData | undefined;
  if (!hook) {
    hook = {
      effect,
      cleanup: undefined,
      deps: deps ? [...deps] : undefined,
      hasRun: false,
    };
    instance.hooks[hookIndex] = hook;
  }

  const shouldRun =
    !hook.hasRun ||
    deps === undefined || // Always run if no deps
    hook.deps === undefined || // Run if previous had no deps
    !depsEqual(hook.deps, deps); // Run if deps changed

  if (shouldRun) {
    // Clean up previous effect
    if (hook.cleanup) {
      hook.cleanup();
    }

    // Run the effect
    const cleanup = effect();
    hook.cleanup = typeof cleanup === "function" ? cleanup : undefined;
    hook.deps = deps ? [...deps] : undefined;
    hook.hasRun = true;
  }
}

function depsEqual(oldDeps: any[], newDeps: any[]): boolean {
  if (oldDeps.length !== newDeps.length) {
    return false;
  }

  for (let i = 0; i < oldDeps.length; i++) {
    if (oldDeps[i] !== newDeps[i]) {
      return false;
    }
  }

  return true;
}
