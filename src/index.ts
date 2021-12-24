import mitt from "mitt";

export abstract class RawOnceInit<T, G = T> {
  private observe: T | undefined;
  promise: Promise<G> | null = null;
  constructor(defaultValue?: T) {
    if (defaultValue) {
      this.observe = defaultValue;
    }
  }
  protected abstract initPromise(): Promise<G>;
  protected abstract factory(raw: G, observe: T | undefined): void;
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

  refresh = async () => {
    /** 如果没有在刷新, 则进行刷新 */
    if (!this.promise) {
      this.promise = this.initPromise();
      this.emitter.emit("loading", true);
      this.factory(await this.promise, this.observe);
      this.promise = null;
      this.initialized = true;
      this.emitter.emit("loading", false);
    }
  };

  onLoading(handler: (event: boolean) => void) {
    this.emitter.on("loading", handler);
  }
}
