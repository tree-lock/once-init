export declare class OnceInit<T, P extends Array<any> = []> {
  protected promiseFunction: (...param: P) => Promise<T>;
  protected processedParams: P[];
  protected returnValueMap: Map<number, T>;
  protected promiseMap: Map<number, Promise<T> | null>;
  constructor(initPromise: (...param: P) => Promise<T>);
  init(...param: P): Promise<T>;
  refresh(...param: P): Promise<T>;
  get(...param: P): T | undefined;
  /**
   * 强制执行，
   * @param param
   * @returns
   */
  exceed(...param: P): Promise<T>;
  /**
   * 等待param对应的promise执行结束，如果当前没有正在执行的对应的promise，将不会执行等待
   * 否则等待执行直到没有对应的promise
   * @param param
   */
  wait(...param: P): Promise<void>;
}
