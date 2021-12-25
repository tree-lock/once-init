export declare abstract class RawOnceInit<T, G = T> {
  private observe;
  promise: Promise<G> | null;
  constructor(defaultValue?: T);
  protected abstract initPromise(): Promise<G>;
  protected abstract factory(raw: G, observe: T | undefined): void;
  private initialized;
  private emitter;
  get target(): T | undefined;
  init(): Promise<T | undefined>;
  refresh: () => Promise<void>;
  onLoading(handler: (event: boolean) => void): void;
}
