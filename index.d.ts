export default function oi<T, P extends Array<any>>(
  promise: (...param: P) => Promise<T>,
  defaultValue?: T
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
export declare abstract class OnceInit<
  T,
  G = T,
  P extends Array<any> = void[]
> {
  protected observe: T | void;
  protected promise: Promise<G> | null;
  constructor(defaultValue?: T);
  protected abstract initPromise(...param: P): Promise<G>;
  protected factory(raw: G, observe: T | void): void | T;
  protected initialized: boolean;
  protected emitter: import("mitt").Emitter<{
    loading: boolean;
  }>;
  get target(): T | void;
  init(...param: P): Promise<G | T | void>;
  refresh: (...param: P) => Promise<G | T | void>;
  onLoading(handler: (event: boolean) => void): void;
}
