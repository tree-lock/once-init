import mitt from "mitt";

export default function oi<T>(promise: () => Promise<T>): OnceInit<T>;
export default function oi<T>(
  promise: () => Promise<T>,
  defaultValue: T
): OnceInit<T>;
export default function oi<T, G = T>(
  promise: () => Promise<G>,
  factory: (raw: G, observe: T | undefined) => void | T
): OnceInit<T, G>;
export default function oi<T, G = T>(
  promise: () => Promise<G>,
  factory: (raw: G, observe: T) => void | T,
  defaultValue: T
): OnceInit<T, G>;

export default function oi<T, G = T>(...args: any[]): OnceInit<T, G> {
  if (!(args[0] instanceof Function) || args.length > 3 || args.length < 1) {
    throw new Error("Arguments of oi is not supported");
  }
  const promise: () => Promise<G> = args[0];
  if (args.length === 1) {
    return new (class extends OnceInit<T, G> {
      protected initPromise = promise;
    })();
  } else if (args.length === 2) {
    if (args[1] instanceof Function) {
      const factory: (raw: G, observe: T | undefined) => void | T = args[1];
      return new (class extends OnceInit<T, G> {
        protected initPromise = promise;
        protected factory = factory;
      })();
    } else {
      const defaultValue: T = args[1];
      return new (class extends OnceInit<T, G> {
        protected initPromise = promise;
      })(defaultValue);
    }
  }
  const factory: (raw: G, observe: T | undefined) => void | T = args[1];
  const defaultValue: T = args[2];
  return new (class extends OnceInit<T, G> {
    protected initPromise = promise;
    protected factory = factory;
  })(defaultValue);
}

export abstract class OnceInit<T, G = T> {
  private observe: T | undefined;
  private promise: Promise<G> | null = null;
  constructor(defaultValue?: T) {
    this.observe = defaultValue;
  }
  protected abstract initPromise(): Promise<G>;
  protected factory(raw: G, observe: T | undefined): void | T {
    return (observe = raw as unknown as T);
  }
  private initialized: boolean = false;
  private emitter = mitt<{
    loading: boolean;
  }>();

  get target() {
    if (!this.initialized) {
      this.refresh();
    }
    return this.observe;
  }
  async init() {
    if (this.promise) {
      return this.promise.then(() => this.observe);
    }
    if (!this.initialized) {
      await this.refresh();
    }
    return this.target;
  }

  refresh = async (): Promise<T | void> => {
    /** 如果没有在刷新, 则进行刷新 */
    if (!this.promise) {
      this.promise = this.initPromise();
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
      return this.promise.then((res) => {
        return this.observe;
      });
    }
  };

  onLoading(handler: (event: boolean) => void) {
    this.emitter.on("loading", handler);
  }
}

// export default Object.assign(oi, { OnceInit });
