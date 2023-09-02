import isEqual from "lodash/isEqual";
export class OnceInit<T, P extends Array<any> = []> {
  protected _promiseFunction: (...param: P) => Promise<T>;
  protected _processedParams: P[] = [];
  protected _returnValueList: Array<T> = [];
  protected _promiseList: Array<Promise<T> | null> = [];

  constructor(initPromise: (...param: P) => Promise<T>) {
    this._promiseFunction = initPromise;
  }

  /** 清空某个参数的缓存 */
  clear(...params: P | []) {
    if (params.length === 0) {
      this._promiseList.length = 0;
      this._returnValueList.length = 0;
      this._processedParams.length = 0;
    } else {
      const index = this._processedParams.findIndex((item) => {
        isEqual(item, params);
      });
      this._promiseList.splice(index, 1);
      this._returnValueList.splice(index, 1);
      this._processedParams.splice(index, 1);
    }
  }

  /** 初始化，returnValueMap中对应的参数存在变量，则不会再请求 */
  init = (...param: P): Promise<T> => {
    // 查看是否在已执行过的参数中
    const index = this._processedParams.findIndex((item) =>
      isEqual(item, param)
    );
    if (index === -1) {
      // 如果不在已执行参数中，将参数推入，并且执行
      const index = this._processedParams.length;
      this._processedParams.push(param);
      // 创建一个Promise
      const promise = this._promiseFunction(...param);
      // 将promise置入哈希表，设定该参数的promise正在执行
      this._promiseList[index] = promise;
      promise
        .then((res) => {
          this._returnValueList[index] = res;
          this._promiseList[index] = null;
        })
        .catch(() => {
          this._promiseList[index] = null;
        });
      return promise;
    } else {
      // 如果在已执行参数中，可能已经执行完毕，可能正在执行中
      // 如果执行完毕，在 returnValueMap 中能够找到返回值
      if (this._returnValueList.length > index) {
        return new Promise<T>((resolve) => {
          resolve(this._returnValueList[index]);
        });
      }
      // 否则，必然还在执行中
      return this._promiseList[index] as Promise<T>;
    }
  };

  /** 刷新，如果存在正在执行的对应参数的Promise，则不会创建新的Promise */
  refresh = (...param: P): Promise<T> => {
    // 查看是否在已执行过的参数中
    const index = this._processedParams.findIndex((item) =>
      isEqual(item, param)
    );
    if (index === -1) {
      // 如果不在已执行参数中，说明连第一次执行都还没有进行，可以使用init进行返回值
      return this.init(...param);
    } else {
      // 在已执行参数中
      // 如果正在执行，则返回正在执行的返回值即可
      let promise = this._promiseList.at(index);
      if (promise) {
        return promise;
      }
      // 此时处于未执行状态，创建一个promise
      promise = this._promiseFunction(...param);
      // 将promise置入哈希表，设定该参数的promise正在执行
      this._promiseList[index] = promise;
      promise
        .then((res) => {
          this._returnValueList[index] = res;
          this._promiseList[index] = null;
        })
        .catch(() => {
          this._promiseList[index] = null;
        });
      return promise;
    }
  };

  send = this.refresh;
  request = this.refresh;

  /** 同步获取值，如果参数存在返回值，则返回，否则返回undefined */
  get = (...param: P): T | undefined => {
    const index = this._processedParams.findIndex((item) =>
      isEqual(item, param)
    );
    return this._returnValueList.at(index);
  };

  /**
   * 强制执行，无论对应参数的Promise是否正在执行，都创建一个新的promise执行
   * 并覆盖在执行中的promise
   *
   * 类似于取消重复的Promise
   * @param param
   * @returns
   */
  exceed = (...param: P): Promise<T> => {
    // 查看是否在已执行过的参数中
    const index = this._processedParams.findIndex((item) =>
      isEqual(item, param)
    );
    if (index === -1) {
      // 如果不在已执行参数中，说明连第一次执行都还没有进行，可以使用init进行返回值
      return this.init(...param);
    } else {
      // 在已执行参数中
      // 无论是否正在执行，都强制进行执行，并覆盖在Map中已经在执行的promise
      // 如果先refresh再马上exceed，会创建两个不同的Promise，返回值也会不同
      const promise = this._promiseFunction(...param);
      // 将promise置入哈希表，设定该参数的promise正在执行
      this._promiseList[index] = promise;
      promise
        .then((res) => {
          this._returnValueList[index] = res;
          this._promiseList[index] = null;
        })
        .catch(() => {
          this._promiseList[index] = null;
        });
      return promise;
    }
  };

  /**
   * 执行源函数
   * @param param
   * @returns
   */
  execute = (...param: P): Promise<T> => {
    return this._promiseFunction(...param);
  };

  /**
   * 等待param对应的promise执行结束，如果当前没有正在执行的对应的promise，将不会执行等待
   * 否则等待执行直到没有对应的promise
   * exceed会推迟wait的执行返回
   * @param param
   */
  wait = async (...param: P): Promise<void> => {
    const index = this._processedParams.findIndex((item) =>
      isEqual(item, param)
    );
    const promise = this._promiseList.at(index);
    if (!promise) {
      return;
    }
    await promise;
    return await this.wait(...param);
  };

  get promiseFunction() {
    return this._promiseFunction;
  }

  get processedParams() {
    return this._processedParams;
  }

  get returnValueList() {
    return this._returnValueList;
  }

  get promiseList() {
    return this._promiseList;
  }
}
