import mitt from "mitt";

export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>
): OnceInit<T, T, P>;
export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>,
  defaultValue: T
): OnceInit<T, T, P>;
export default function oi<T, G = T, P extends Array<any> = void[]>(
  promise: (...param: P) => Promise<G>,
  factory: (raw: G, observe: T | void) => void | T
): OnceInit<T, G, P>;
export default function oi<T, G = T, P extends Array<any> = void[]>(
  promise: (...param: P) => Promise<G>,
  factory: (raw: G, observe: T) => void | T,
  defaultValue: T
): OnceInit<T, G, P>;

export default function oi<T, G = T, P extends Array<any> = void[]>(
  ...args: any[]
): OnceInit<T, G, P> {
  if (!(args[0] instanceof Function) || args.length > 3 || args.length < 1) {
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
      return new (class extends OnceInit<T, G, P> {
        protected initPromise = promise;
      })(defaultValue);
    }
  }
  const factory: (raw: G, observe: T | void) => void | T = args[1];
  const defaultValue: T = args[2];
  return new (class extends OnceInit<T, G, P> {
    protected initPromise = promise;
    protected factory = factory;
  })(defaultValue);
}

export abstract class OnceInit<T, G = T, P extends Array<any> = void[]> {
  protected observe: T | void;
  protected promise: Promise<G> | null = null;
  constructor(defaultValue?: T) {
    this.observe = defaultValue;
  }
  protected abstract initPromise(...param: P): Promise<G>;
  protected factory(raw: G, observe: T | void): void | T {
    return (observe = raw as unknown as T);
  }
  protected initialized: boolean = false;
  protected emitter = mitt<{
    loading: boolean;
  }>();

  get target(): T | void {
    if (!this.initialized && this.initPromise.length === 0) {
      this.refresh(...([] as unknown as P));
    }
    return this.observe;
  }
  async init(...param: P): Promise<G | T | void> {
    if (this.promise) {
      return this.promise.finally(() => this.observe);
    }
    if (!this.initialized) {
      await this.refresh(...param);
    }
    return this.target;
  }

  refresh = async (...param: P): Promise<G | T | void> => {
    if (!this.promise) {
      this.promise = this.initPromise(...param);
      this.emitter.emit("loading", true);
      const ans = this.factory(await this.promise, this.observe);
      if (ans) {
        this.observe = ans;
      }
      this.promise = null;
      this.initialized = true;
      this.emitter.emit("loading", false);
      return this.observe;
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
