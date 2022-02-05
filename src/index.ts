import mitt, { Emitter } from "mitt";
import _ from "lodash";

interface Options<P> {
  /** 是否区分参数 */
  paramDisc: boolean;
}

export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>,
  options: Options<P>
): OnceInit<T, T, P>;
export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>,
  defaultValue: T,
  options: Options<P>
): InitOnceInit<T, T, P>;
export default function oi<T, G = T, P extends Array<any> = void[]>(
  promise: (...param: P) => Promise<G>,
  factory: (raw: G, observe: T | void) => void | T,
  options: Options<P>
): OnceInit<T, G, P>;
export default function oi<T, G = T, P extends Array<any> = void[]>(
  promise: (...param: P) => Promise<G>,
  factory: (raw: G, observe: T) => void | T,
  defaultValue: T,
  options: Options<P>
): InitOnceInit<T, G, P>;

export default function oi<T, G = T, P extends Array<any> = void[]>(
  ...args: any[]
): OnceInit<T, G, P> {
  if (!(args[0] instanceof Function) || args.length > 4 || args.length < 1) {
    throw new Error("Arguments of oi is not supported");
  }
  const promise: (...param: P) => Promise<G> = args[0];
  if (args.length === 1) {
    return new (class extends OnceInit<T, G, P> {
      protected initPromise = promise;
    })();
  } else if (args.length === 2) {
    if (args[1] instanceof Function) {
      const factory: (raw: G, observe: T | void) => void | T = args[1];
      return new (class extends OnceInit<T, G, P> {
        protected initPromise = promise;
        protected factory = factory;
      })();
    } else {
      const defaultValue: T = args[1];
      return new (class extends InitOnceInit<T, G, P> {
        protected initPromise = promise;
      })(defaultValue);
    }
  }
  const factory: (raw: G, observe: T) => void | T = args[1];
  const defaultValue: T = args[2];
  return new (class extends InitOnceInit<T, G, P> {
    protected initPromise = promise;
    protected factory = factory;
  })(defaultValue);
}
export abstract class OnceInit<T, G = T, P extends Array<any> = void[]> {
  protected observe: T | undefined;
  protected promise: Promise<G> | null = null;
  protected abstract initPromise(...param: P): Promise<G>;
  protected factory(raw: G, observe: T | void): void | T {
    return (observe = raw as unknown as T);
  }
  protected initialized: boolean = false;
  protected emitter = mitt<{
    loading: boolean;
  }>();

  get target(): T | undefined {
    if (!this.initialized && this.initPromise.length === 0) {
      this.refresh(...([] as unknown as P));
    }
    return this.observe;
  }
  async init(...param: P): Promise<G | T> {
    if (this.promise) {
      return this.promise.finally(() => this.observe);
    }
    if (!this.initialized) {
      await this.refresh(...param);
    }
    return this.observe as T;
  }

  refresh = async (...param: P): Promise<G | T> => {
    if (!this.promise) {
      this.promise = this.initPromise(...param);
      this.emitter.emit("loading", true);
      const ans = this.factory(await this.promise, this.observe);
      if (typeof ans !== "undefined" && ans !== null) {
        this.observe = ans;
      }
      this.promise = null;
      this.initialized = true;
      this.emitter.emit("loading", false);
      return this.observe as T;
    } else {
      return this.promise.finally(() => {
        return this.observe;
      });
    }
  };

  onLoading(handler: (event: boolean) => void) {
    this.emitter.on("loading", handler);
  }
}

/** 区分参数的OnceInit */
export abstract class OnceInitDis<T, G = T, P extends Array<any> = void[]> {
  protected observes: Map<P, T> = new Map<P, T>();
  protected promises: Map<P, Promise<G> | null> = new Map<P, Promise<G>>();
  protected initializeds: Map<P, boolean> = new Map<P, boolean>();
  protected abstract initPromise(...param: P): Promise<G>;
  protected factory(raw: G, observe: T | void): void | T {
    return (observe = raw as unknown as T);
  }
  protected paramsUsed: P[] = [];
  protected emitters: Map<
    P,
    Emitter<{
      loading: boolean;
    }>
  > = new Map<
    P,
    Emitter<{
      loading: boolean;
    }>
  >();

  async init(...param: P): Promise<G | T> {
    if (this.promises.has(param)) {
      const promise = this.promises.get(param) as Promise<G>;
      return promise.finally(() => this.observes.get(param) as T);
    }
    if (!this.initializeds.has(param)) {
      await this.refresh(...param);
    }
    return this.observes.get(param) as T;
  }
  // 当前方法是浅比较
  refresh = async (...param: P): Promise<G | T> => {
    if (!this.promises.get(param)) {
      const promise = this.initPromise(...param);
      this.promises.set(param, promise);
      if (this.emitters.has(param)) {
        this.emitters.get(param)?.emit("loading", true);
      } else {
        this.emitters.set(
          param,
          mitt<{
            loading: boolean;
          }>()
        );
        this.emitters.get(param)?.emit("loading", true);
      }
      const ans = this.factory(await promise, this.observes.get(param));
      if (typeof ans !== "undefined" && ans !== null) {
        this.observes.set(param, ans);
      }
      this.promises.set(param, null);
      this.initializeds.set(param, true);
      this.emitters.get(param)?.emit("loading", false);
      return this.observes.get(param) as T;
    } else {
      const promise = this.promises.get(param) as Promise<G>;
      return promise.finally(() => {
        return this.observes.get(param) as T;
      });
    }
  };

  onLoading(param: P, handler: (event: boolean) => void) {
    if (!this.emitters.has(param)) {
      this.emitters.set(param, mitt<{ loading: boolean }>());
    }
    const emitter = this.emitters.get(param) as Emitter<{
      loading: boolean;
    }>;
    emitter.on("loading", handler);
  }
}

/**
 * OnceInit with default value
 */
export abstract class InitOnceInit<
  T,
  G = T,
  P extends Array<any> = void[]
> extends OnceInit<T, G, P> {
  protected declare observe: T;
  get target(): T {
    if (!this.initialized && this.initPromise.length === 0) {
      this.refresh(...([] as unknown as P));
    }
    return this.observe;
  }
  constructor(defaultValue: T) {
    super();
    this.observe = defaultValue;
  }
}
