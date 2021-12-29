export default function oi<T, P>(
  promise: (param?: P) => Promise<T>
): OnceInit<T>;
export default function oi<T, P>(
  promise: (param?: P) => Promise<T>,
  defaultValue: T
): OnceInit<T>;
export default function oi<T, G = T, P = any>(
  promise: (param?: P) => Promise<G>,
  factory: (raw: G, observe: T | undefined) => void | T
): OnceInit<T, G>;
export default function oi<T, G = T, P = any>(
  promise: (param?: P) => Promise<G>,
  factory: (raw: G, observe: T) => void | T,
  defaultValue: T
): OnceInit<T, G>;
export declare abstract class OnceInit<T, G = T, P = any> {
  private observe;
  private promise;
  constructor(defaultValue?: T);
  protected abstract initPromise(param?: P): Promise<G>;
  protected factory(raw: G, observe: T | undefined): void | T;
  private initialized;
  private emitter;
  get target(): T | undefined;
  init(param?: P): Promise<T | undefined>;
  refresh: (param?: P | undefined) => Promise<T | void>;
  onLoading(handler: (event: boolean) => void): void;
}
