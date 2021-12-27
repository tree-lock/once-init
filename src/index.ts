import mitt from "mitt";

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
