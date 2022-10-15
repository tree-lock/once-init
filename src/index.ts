import { OnceInit } from "./once-init";
export * from "./once-init";

export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>
): OnceInit<T, P>;

export default function oi<T, P extends Array<any> = []>(...args: any[]) {
  if (args[0] instanceof Function) {
    const promise = args[0] as (...param: P) => Promise<T>;
    return new (class extends OnceInit<T, P> {})(promise);
  }
}

type K<T> = {
  [k in keyof T]: T[k] extends (...args: any) => any
    ? (...args: Parameters<T[k]>) => Promise<Awaited<ReturnType<T[k]>>>
    : T[k];
};

/**
 * 把对象的所有方法都修改成once-init的refresh方法
 *
 * 即防止对象的所有方法在同一时间执行多次
 *
 * @warning 该方法存在问题，应当使用 Proxy或Object.defineProperty 封装，而不是直接修改
 * @param obj 被封装的对象
 * @returns
 */
export function packagedByRefresh<T extends object>(obj: T) {
  const ans: K<T> & { /** 源对象 */ oiSource: T } = {} as any;
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
