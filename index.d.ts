export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>
): OnceInit<T, T, P>;
export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>,
  defaultValue: T
): InitOnceInit<T, T, P>;
export default function oi<T, G = T, P extends Array<any> = void[]>(
  promise: (...param: P) => Promise<G>,
  factory: (raw: G, observe: T | void) => void | T
): OnceInit<T, G, P>;
export default function oi<T, G = T, P extends Array<any> = void[]>(
  promise: (...param: P) => Promise<G>,
  factory: (raw: G, observe: T) => void | T,
  defaultValue: T
): InitOnceInit<T, G, P>;
export declare abstract class OnceInit<
  T,
  G = T,
  P extends Array<any> = void[]
> {
  protected observe: T | undefined;
  protected promise: Promise<G> | null;
  protected abstract initPromise(...param: P): Promise<G>;
  protected factory(raw: G, observe: T | void): void | T;
  protected initialized: boolean;
  protected emitter: import("mitt").Emitter<{
    loading: boolean;
  }>;
  get target(): T | undefined;
  init(...param: P): Promise<G | T>;
  refresh: (...param: P) => Promise<G | T>;
  onLoading(handler: (event: boolean) => void): void;
}
/**
 * OnceInit with default value
 */
export declare abstract class InitOnceInit<
  T,
  G = T,
  P extends Array<any> = void[]
> extends OnceInit<T, G, P> {
  protected observe: T;
  get target(): T;
  constructor(defaultValue: T);
}
