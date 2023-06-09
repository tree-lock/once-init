import { OnceInit } from "./once-init";
import config from "./config";
export * from "./once-init";

export const version = config.version;

export function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>
): OnceInit<T, P>;

export function oi<T, P extends Array<any> = []>(...args: any[]) {
  if (args[0] instanceof Function) {
    const promise = args[0] as (...param: P) => Promise<T>;
    return new (class extends OnceInit<T, P> {})(promise);
  }
}

export default oi;

/**
 * 把对象的所有的Function都修改成Async Function
 */
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
 * @param obj 被封装的对象
 * @deprecated 该api仍处于测试状态
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
