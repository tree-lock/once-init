# once-init

[![npm license](https://img.shields.io/npm/l/once-init.svg?sanitize=true)](https://github.com/darkXmo/once-init/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/once-init.svg?sanitize=true)](https://www.npmjs.com/package/once-init)

Init Once, Use Everywhere.

只会被初始化一次的对象。

> 第一次调用对象的时候会执行 Promise 初始化，重复调用, 初始化将不会再次执行。

> 同一个 Promise 不会在同一时间内被执行两次。

## 示例

如果使用 `Typescript` ，则需要定义示例的值的类型。

> 例如，此处定义类型为 `number` 。

```typescript
class NumberInstance extends OnceInit<number> {
  protected initPromise(): Promise<number> {
    console.log("Loading");
    return new Promise((res) => {
      setTimeout(() => {
        console.log("Loaded");
        res(1);
      }, 1000);
    });
  }
}
// 设置示例的默认值为 -1
const numberInstance = new NumberInstance(-1);
// 当你获取实例的 target 属性的时候, 就会同步获取到对象的值, 并且开始执行 Promise , 由于是同步获取(Promise还没有加载完成), 所以此时的值为 -1;
console.log(numberInstance.target); // Loading -1
// 等待 2000ms 后, Promise 已经执行完成, 此时值为 1;
setTimeout(() => {
  console.log(numberInstance.target); // Loaded // 1
}, 2000);

// 或者你也可以采用异步读取的方式, 等 Promise 执行完成之后再读取值
numberInstance.init().then(() => {
  console.log(numberInstance.target); // 1
});
```

## Api

### `initPromise`

必须实现 `initPromise` ，它要求返回一个 `Promise` ，这个 `Promise` 的返回值将作为初始化和刷新的实例的值。

```typescript
class SomeInstance extends OnceInit<number> {
  protected initPromise(): Promise<number> {
    return new Promise((res) =>
      setTimeout(() => {
        res(1);
      }, 100)
    );
  }
}
```

### constructor

实例构建的时候可以传入默认值，若不传，实例的默认 `target` 值为 `undefined` 。

```typescript
const ans = new SomeInstance(0);
```

### `target`

同步获取此时实例的值

- 若值还没有被初始化
  - 开始执行初始化函数.
  - 如果定义了默认值, 则返回默认值, 否则返回 undefined
- 只有刷新能重置这个值。

```typescript
const ans = new SomeInstance();
console.log(ans.target); // undefined;
```

```typescript
const ans = new SomeInstance(-1);
console.log(ans.target); // -1;
```

```typescript
const ans = new SomeInstance(-1);
console.log(ans.target); // -1;

// Do something
await sleep(100); // Waiting for promise resolved
console.log(ans.target); // 1;
```

就算你在同一时间获取了多次 `target` , `Promise` 也只会被执行一次.

```typescript
class SomeInstance extends OnceInit<number> {
  protected initPromise(): Promise<number> {
    return new Promise((res) => {
      console.log("Loading");
      setTimeout(() => {
        console.log("Loaded");
        res(1);
      }, 100);
    });
  }
}

const ans = new SomeInstance(-1);
console.log(ans.target);
// Loading
// -1
console.log(ans.target);
// -1
await sleep(100); // Waiting for promise resolved
// Loaded
console.log(ans.target);
// 1
```

### `init`

异步获取此时实例的值

```typescript
const ans = new SomeInstance(-1);

console.log(ans.init()); // Promise<number>
```

```typescript
const ans = new SomeInstance(-1);

console.log(await ans.init()); // 1
console.log(ans.target); // 1
```

同时获取 `target` 和调用 `init`, `Promise` 只会被执行一次.

```typescript
class SomeInstance extends OnceInit<number> {
  protected initPromise(): Promise<number> {
    return new Promise((res) => {
      console.log("Loading");
      setTimeout(() => {
        console.log("Loaded");
        res(1);
      }, 100));
    };
  }
}

const ans = new SomeInstance(-1);

console.log(ans.target);
// Loading
// -1

console.log(await ans.init());
// Loaded
// 1

console.log(ans.target);
// 1
```

### `refresh`

异步刷新实例的值

- 若此时值还没有初始化，则将初始化它

- 返回值为刷新之后的实例的值

```typescript
let i = 0;
class SomeInstance extends OnceInit<number> {
  protected initPromise(): Promise<number> {
    return new Promise((res) => {
      console.log("Loading");
      setTimeout(() => {
        console.log("Loaded");
        res(++i);
      }, 100);
    });
  }
}

const ans = new SomeInstance(i);

console.log(ans.target);
// Loading
// 0

console.log(await ans.init());
// Loaded
// 1

console.log(await ans.refresh());
// Loading // Waiting for
// Loaded
// 2
```

同步执行 `target`, `init`, `refresh` ，`Promise` 只会被执行一次

```typescript
let i = 0;
class SomeInstance extends OnceInit<number> {
  protected initPromise(): Promise<number> {
    return new Promise((res) => {
      console.log("Loading");
      setTimeout(() => {
        console.log("Loaded");
        res(++i);
      }, 100);
    });
  }
}

const ans = new SomeInstance(i);
console.log(ans.target);
// Loading
// 0
```

```typescript
console.log(await ans.refresh());
// Loaded
// 1
```

```typescript
console.log(await ans.refresh());
// Loaded
// 1
ans.refresh();
// Loading
ans.refresh(); // Nothing Happened
ans.refresh(); // Nothing Happened
```

### `onLoading`

`Promise` 开始执行和结束执行的回调函数。

用于监听值的初始化和刷新。

```typescript
class SomeInstance extends OnceInit<number> {
  protected initPromise(): Promise<number> {
    return new Promise((res) => {
      console.log("Loading");
      setTimeout(() => {
        console.log("Loaded");
        res(++i);
      }, 100);
    });
  }
}

const ans = new SomeInstance();
ans.onLoading((event: boolean) => {
  if (event) {
    console.log("instance start loading");
  } else {
    console.log("instance loaded");
  }
});

console.log(ans.target);
// Loading
// instance start loading
// 0
// Loaded
// instance loaded
```

### `factory`

有时候可能需要对 `Promise` 执行的结果进行一些处理再修改 `target` 。

- 如果 `Promise` 的结果和 `target` 不同类型，需要传入它们的类型

```typescript
class SomeInstance extends OnceInit<number> {
  protected initPromise(): Promise<number> {
    return new Promise((res) => {
      setTimeout(() => {
        res(1);
      }, 100);
    });
  }
  protected factory(raw: number) {
    return raw * 100;
  }
}

const ans = new SomeInstance();

console.log(await ans.init()); // 100
```

不同类型，例如 `Promise` 返回的值是 `number` ，而 `target` 的类型是 `Date()`;

则需要为类指定类型为 `<Date, number>` 。

```typescript
class SomeInstance extends OnceInit<Date, number> {
  protected initPromise(): Promise<number> {
    return new Promise((res) => {
      setTimeout(() => {
        res(new Date().getTime());
      }, 100);
    });
  }
  protected factory(raw: number): Date {
    return new Date(raw);
  }
}

const ans = new SomeInstance();

console.log(await ans.init()); // Mon Dec 27 2021 14:10:00 GMT+0800 (中国标准时间)
```

如果 `target` 的类型是对象，而你并不想修改整个对象，只想修改对象的一部分，可以通过第二个参数 `observe` 修改。

> `observe` 是实际上被监听的对象，但是它是私有变量，不能直接访问。

> 如果只修改一部分，则不需要提供返回值

```typescript
interface SomeForm {
  foo: string;
  date: string;
}
class SomeInstance extends OnceInit<SomeForm, number> {
  protected initPromise(): Promise<number> {
    return new Promise((res) => {
      setTimeout(() => {
        res(new Date().getTime());
      }, 100);
    });
  }
  protected factory(
    raw: number,
    observe: SomeForm | undefined
  ): SomeForm | void {
    if (observe) {
      return {
        foo: "something",
        date: new Date(raw),
      };
    }
    observe.date = new Date(raw);
  }
}

const ans = new SomeInstance();

console.log(await ans.init());
/**
 * {
 *   foo: "something",
 *   date: Mon Dec 27 2021 14:10:00 GMT+0800 (中国标准时间)
 * }
 */
```

## HELP

你可以把它改造成一个 `Vue3-Composition Api` 的版本。

```typescript
export abstract class RefOnceInit<T, G = T> extends OnceInit<
  Ref<T | undefined>,
  G
> {
  loading = ref<boolean>(false);
  protected abstract factory(raw: G, observe: Ref<T | undefined>): void;
  constructor(defaultValue?: T) {
    const refed = ref<T>();
    refed.value = defaultValue;
    super(refed);
    this.onLoading((event) => {
      this.loading.value = event;
    });
  }
}
```

这样 `RefOnceInit` 就是一个响应式的对象。

具体可以参照另一个库 `RefOnceInit`; (还没写)

## TODO

1. 提供一个 `oi` 的 `api`，不需要传入类型。
