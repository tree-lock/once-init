import { OnceInit } from "./once-init";
export * from "./once-init";
export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>
): OnceInit<T, P>;
