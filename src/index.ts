import { OnceInit } from "./once-init";
export * from "./once-init";

export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>
): OnceInit<T, P>;

export default function oi<T, P extends Array<any> = []>(
  ...args: any[]
): OnceInit<T, P> {
  const promise = args[0] as (...param: P) => Promise<T>;
  return new (class extends OnceInit<T, P> {})(promise);
}
