export default function oi<T>(promise: () => Promise<T>): OnceInit<T, T, void>;
export default function oi<T>(
  promise: () => Promise<T>,
  defaultValue: T
): OnceInit<T, T, void>;
export default function oi<T, G = T>(
  promise: () => Promise<G>,
  factory: (raw: G, observe: T | undefined) => void | T
): OnceInit<T, G, void>;
export default function oi<T, G = T>(
  promise: () => Promise<G>,
  factory: (raw: G, observe: T) => void | T,
  defaultValue: T
): OnceInit<T, G, void>;
export default function oi<T, P>(
  promise: (param: P) => Promise<T>
): OnceInit<T, T, P>;
export default function oi<T, P>(
  promise: (param: P) => Promise<T>,
  defaultValue: T
): OnceInit<T, T, P>;
export default function oi<T, G = T, P = undefined>(
  promise: (param: P) => Promise<G>,
  factory: (raw: G, observe: T | undefined) => void | T
): OnceInit<T, G, P>;
export default function oi<T, G = T, P = undefined>(
  promise: (param: P) => Promise<G>,
  factory: (raw: G, observe: T) => void | T,
  defaultValue: T
): OnceInit<T, G, P>;
export declare abstract class OnceInit<T, G = T, P = void> {
  private observe;
  private promise;
  constructor(defaultValue?: T);
  protected abstract initPromise(param: P): Promise<G>;
  protected factory(raw: G, observe: T | undefined): void | T;
  private initialized;
  private emitter;
  get target(): T | undefined;
  init(param: P): Promise<G | T | undefined>;
  refresh: (param: P) => Promise<G | T | void>;
  onLoading(handler: (event: boolean) => void): void;
}
