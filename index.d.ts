export declare abstract class OnceInit<T, G = T> {
  private observe;
  private promise;
  constructor(defaultValue?: T);
  protected abstract initPromise(): Promise<G>;
  protected factory(raw: G, observe: T | undefined): void | T;
  private initialized;
  private emitter;
  get target(): T | undefined;
  init(): Promise<T | undefined>;
  refresh: () => Promise<T | void>;
  onLoading(handler: (event: boolean) => void): void;
}
