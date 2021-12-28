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
