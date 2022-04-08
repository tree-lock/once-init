import { OnceInit } from "./once-init";
export * from "./once-init";

export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>
): OnceInit<T, P>;

export default function oi<T, P extends Array<any>>(obj: T): K<T>;

export default function oi<T, P extends Array<any> = []>(...args: any[]) {
  if (args[0] instanceof Function) {
    const promise = args[0] as (...param: P) => Promise<T>;
    return new (class extends OnceInit<T, P> {})(promise);
  }
  return oiObject(args[0]);
}

type K<T> = {
  [k in keyof T]: T[k] extends (...args: any) => any
    ? (...args: Parameters<T[k]>) => Promise<Awaited<ReturnType<T[k]>>>
    : T[k];
};

function oiObject<T extends object>(obj: T) {
  const ans: K<T> & { oiSource: T } = {} as any;
  for (let key in obj) {
    if (obj[key] instanceof Function) {
      ans[key] = oi(obj[key] as any).refresh as any;
    } else {
      ans[key] = obj[key] as any;
    }
  }
  ans.oiSource = obj;
  return ans;
}
