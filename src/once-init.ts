/**
 * once-init v1.0.0-beta 版本
 * 1. 由于用户可以在Promise Function里自定义相关的状态，`once-init`没有必要画蛇添足，因此取消了target和factory方法，取消了loading加载状态。
 * 2. 添加了参数区分，现在，允许通过参数来划分不同的Promise Function，参数通过`lodash.isEqual`来进行区分。
 * 3. 添加了 强制执行方法exceed() 和 等待执行方法wait()
 * 4. 同步方法为get()，如果值在之前初始化过，则返回对应的值，否则返回undefined，同步执行不再主动触发promise。
 * 5. send、request和refresh是同一个方法，定义它们是为了方便更好的语义化。
 */
import { isEqual } from "lodash";
export class OnceInit<T, P extends Array<any> = []> {
  protected promiseFunction: (...param: P) => Promise<T>;
  protected processedParams: P[] = [];
  protected returnValueMap: Map<number, T> = new Map<number, T>();
  protected promiseMap: Map<number, Promise<T> | null> = new Map<
    number,
    Promise<T>
  >();

  constructor(initPromise: (...param: P) => Promise<T>) {
    this.promiseFunction = initPromise;
  }

  /** 初始化，returnValueMap中对应的参数存在变量，则不会再请求 */
  init = async (...param: P): Promise<T> => {
    // 查看是否在已执行过的参数中
    const index = this.processedParams.findIndex((item) =>
      isEqual(item, param)
    );
    if (index === -1) {
      // 如果不在已执行参数中，将参数推入，并且执行
      const index = this.processedParams.length;
      this.processedParams.push(param);
      // 创建一个Promise
      const promise = this.promiseFunction(...param);
      // 将promise置入哈希表，设定该参数的promise正在执行
      this.promiseMap.set(index, promise);
      promise.then((res) => {
        this.returnValueMap.set(index, res);
        this.promiseMap.set(index, null);
      });
      return await promise;
    } else {
      // 如果在已执行参数中，可能已经执行完毕，可能正在执行中
      // 如果执行完毕，在 returnValueMap 中能够找到返回值
      if (this.returnValueMap.has(index)) {
        return this.returnValueMap.get(index) as T;
      }
      // 否则，必然还在执行中
      return (await this.promiseMap.get(index)) as T;
    }
  };

  /** 刷新，如果存在正在执行的对应参数的Promise，则不会创建新的Promise */
  refresh = async (...param: P): Promise<T> => {
    // 查看是否在已执行过的参数中
    const index = this.processedParams.findIndex((item) =>
      isEqual(item, param)
    );
    if (index === -1) {
      // 如果不在已执行参数中，说明连第一次执行都还没有进行，可以使用init进行返回值
      return await this.init(...param);
    } else {
      // 在已执行参数中
      // 如果正在执行，则返回正在执行的返回值即可
      let promise = this.promiseMap.get(index);
      if (promise) {
        return await promise;
      }
      // 此时处于未执行状态，创建一个promise
      promise = this.promiseFunction(...param);
      // 将promise置入哈希表，设定该参数的promise正在执行
      this.promiseMap.set(index, promise);
      promise.then((res) => {
        this.returnValueMap.set(index, res);
        this.promiseMap.set(index, null);
      });
      return await promise;
    }
  };

  send = this.refresh;
  request = this.refresh;

  /** 同步获取值，如果参数存在返回值，则返回，否则返回undefined */
  get = (...param: P): T | undefined => {
    const index = this.processedParams.findIndex((item) =>
      isEqual(item, param)
    );
    return this.returnValueMap.get(index);
  };

  /**
   * 强制执行，无论对应参数的Promise是否正在执行，都创建一个新的promise执行
   * 并覆盖在执行中的promise
   *
   * 类似于取消重复的Promise
   * @param param
   * @returns
   */
  exceed = async (...param: P): Promise<T> => {
    // 查看是否在已执行过的参数中
    const index = this.processedParams.findIndex((item) =>
      isEqual(item, param)
    );
    if (index === -1) {
      // 如果不在已执行参数中，说明连第一次执行都还没有进行，可以使用init进行返回值
      return await this.init(...param);
    } else {
      // 在已执行参数中
      // 无论是否正在执行，都强制进行执行，并覆盖在Map中已经在执行的promise
      // 如果先refresh再马上exceed，会创建两个不同的Promise，返回值也会不同
      const promise = this.promiseFunction(...param);
      // 将promise置入哈希表，设定该参数的promise正在执行
      this.promiseMap.set(index, promise);
      promise.then((res) => {
        this.returnValueMap.set(index, res);
        this.promiseMap.set(index, null);
      });
      return await promise;
    }
  };

  /**
   * 执行源函数
   * @param param
   * @returns
   */
  execute = async (...param: P): Promise<T> => {
    return this.promiseFunction(...param);
  };

  /**
   * 等待param对应的promise执行结束，如果当前没有正在执行的对应的promise，将不会执行等待
   * 否则等待执行直到没有对应的promise
   * exceed会推迟wait的执行返回
   * @param param
   */
  wait = async (...param: P): Promise<void> => {
    const index = this.processedParams.findIndex((item) =>
      isEqual(item, param)
    );
    const promise = this.promiseMap.get(index);
    if (!promise) {
      return;
    }
    await promise;
    return await this.wait(...param);
  };
}