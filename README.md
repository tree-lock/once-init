# once-init

[![npm license](https://img.shields.io/npm/l/once-init.svg?sanitize=true)](https://github.com/darkXmo/once-init/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/once-init.svg?sanitize=true)](https://www.npmjs.com/package/once-init)

Init Once, Use Everywhere.

Let Promise only be initialized once.

> The Promise will be executed when the attribute target is called for the first time, and the Promise executed will not be executed again when called repeatedly.

> The same Promise will not be executed twice at the same time. Only the first one will be executed, while the rest can still get the result of the promise after executed.

## 规定

1. **`OnceInit` 封装的 `Promise Function` ，永远不会在同一时间被执行两次。**
2. 如果上一个 `Promise Function` 没有执行完成就调用了下一个 `Promise Function` ，那么下一个 `Promise Function` 将共享上一个`Promise Function` 的 `Promise`。

## 示例

假设存在一个 `axios` `Promise` 请求，返回值类型为 `number` ，值为 `777`。

```typescript
const requestNumber = async () => {
  const res: AxiosResponse<number> = await axiosInstance.get("/api/number");
  return res.data;
};
```

你可以使用 `oi` 来封装这个 `Promise` 函数

```typescript
const oiInstance = oi(requestNumber);
```

现在，你可以在任何地方调用这个实例。

### init

假设有两个方法 `functionA` 和 `functionA`，都需要发送这个请求。

```typescript
async function functionA() {
  ...
  const res = await oiInstance.init();
  ...
}

async function functionB() {
  ...
  const res = await oiInstance.init();
  ...
}
```

而你需要在某个文件中，需要同时使用这两个方法。

```typescript
async function functionC() {
  await functionA();
  await functionB();
}

function functionD() {
  functionA();
  functionB();
}
```

对于 `functionC`， 在**第一次执行 `init` 之后**，`oiInstance` 将会保存 `Promise` 的执行结果，此后再执行 `init` ，将**不会再发出 `Promise` 请求**。

对于 `functionD`， `api` 请求只会发送一次，`functionA` 和 `functionB` 中的 `res` 都将等待**同一个请求**的返回值，不会发送重复的请求。

### target

`target` 是同步获取返回值的 `api` 。

```typescript
function functionE() {
  ...
  const res = oiInstance.target;
  ...
}
```

如果在这之前已经完成初始化的话，`target` 的值将是 `Promise` 的返回值，否则，`target` 的值将会是 `undefined` 。例如，

```typescript
const res = oiInstance.target; // undefined
```

```typescript
await oiInstance.init();

const res = oiInstance.target; // [Return Value] 777
```

请注意，虽然是同步获取，如果没有事先完成初始化的话，获取 `target` 属性也会开始初始化。

在下面这个例子中，我们假设 `api` 的请求时长是 `10s` 。在下面这个例子里，请求在

```typescript
const res = oiInstance.target; // undefined
/** Promise has been executed. */
setTimeout(async () => {
  const resAfter = oiInstance.target; // [Return Value] 777
  const intAffter = await oiInstance.init(); // [Return Value] 777 , Promise will not be executed again.
  /** Since The Promise has been executed before, it will not be executed again. */
}, 10001);
```

和同时先后同步执行两次 `init` 一样，假如在获取 `init` 之前访问了 `target` 属性，而 访问 `target` 导致的 `Promise` 请求没有结束的话，`init` 将直接等待上一个 `Promise` 结束并获取同一个值。

下面这个例子将会帮助你理解。

```typescript
const res = oiInstance.target; // undefined
setTimeout(async () => {
  const resAfter = oiInstance.target; // undefined
  const intAffter = await oiInstance.init(); // [Return Value] 777
  /** Since The Promise has been executing it will not be executing again.  */
  /** After About 8000ms, The Value will be return by the first promise done */
}, 2000);
```

### defaultValue

这里的 `init` 将会等待上一个 `Promise` 函数执行的返回值，由于 `init` 是在 `200ms` 之后才执行的，所以它只需要再等待大约 `800ms` 就能获得这个返回值了。

使用 `target` 属性通常需要搭配默认值，而 `oi` 的第二个参数可以为你的 `Promise` 定义默认值。

```typescript
const defaultValue = -1;
const oiInstance = oi(requestNumber, defaultValue);

const ans = oiInstance.target; // -1
```

### refresh

你如果想要更新实例的值，则需要调用 `refresh` 。

假设第一次加载的值是 `777` ，而刷新之后的值是 `888` 。

```typescript
const ans = await oiInstance.init(); // [Retrun Value] 777
const ansAfterRefresh = await oiInstance.refresh(); // [Retrun Value] 888
```

刷新之后，调用 `init` 和 `target` 获取的值都将会更新。

```typescript
oiInstance.target; // undefined
await oiInstance.init(); // [Promise Retrun Value] 777
oiInstance.target; // 777
await oiInstance.refresh(); // [Promise Retrun Value] 888
/** Promise will not be exectued */
oiInstance.target; // 888
await oiInstance.init(); // 888
```

你可以直接使用 `refresh` 来执行初始化，在初始化上，它和 `init` 的效果一致。

```typescript
oiInstance.target; // undefined
await oiInstance.refresh(); // [Promise Retrun Value] 777
oiInstance.target; // 777
await oiInstance.refresh(); // [Promise Retrun Value] 888
oiInstance.target; // 888
```

如果同步先后调用了两次 `refresh` ，两次 `refresh` 将等待**同一个请求**的返回值，不会发送重复的请求。

```typescript
async function functionA() {
  console.log("A", await oiInstance.refresh());
}
async function functionB() {
  console.log("B", await oiInstance.refresh());
}
functionA(); // 'A', [Promise Retrun Value] 777
functionB(); // 'B', [Promise Retrun Value] 777
/** only one promise is executed */
/** functionA and functionB share A same promise and promise return value */
```

我们仍然假设 `api` 请求的时长为 `10s === 10000ms` 。

```typescript
oiInstance.refresh();
setTimeout(async () => {
  await oiInstance.refresh();
}, 2000);
/** After 10000ms, two refresh will be exected at the same time */
```

如果异步先后调用了两次 `refresh` ，那么发送两次请求。

```typescript
async function functionA() {
  console.log("A", await oiInstance.refresh());
}
async function functionB() {
  console.log("B", await oiInstance.refresh());
}
await functionA(); // 'A', [Promise Retrun Value] 777
await functionB(); // 'B', [Promise Retrun Value] 888
/** Two different promises were executed */
```

**如果你觉得逻辑太过复杂，那请至少要记住一点，`OnceInit` 封装的 `Promise Function` ，永远不会在同一时间被执行两次**。

### factory

如果 `Promise` 的返回值不是是你期望的返回值，你可以传入 `factory` 参数返回值加工它。

例如，`api` 传递过来的数据是一个时间戳，而你希望获得的是一个 `Date` 对象。

```typescript
const ans = await oiInstance.init(); // [Timestamp] 1640673370941
const wishAns = new Date(ans);
```

你可以再封装一层，或者，你可以传入一个 `factory` 函数作为参数，让 `Promise Function` 在执行 `Promise` 完成之后，自动加工为新的值。

```typescript
const factory = (raw: number) => new Date(raw);
const oiInstance = oi(requestTimeStamp, factory);

const ans = await oiInstance.init(); // [Promise Return Value] Date
```

你仍然可以传入默认值，作为第三个参数，但它的类型应当是 `factory` 的返回值的类型。

```typescript
const oiInstance = oi(requestTimeStamp, factory, new Date());
```

如果 `Promise` 的返回值只是某个对象的一部分，你还可以用 `factory` 的第二个参数来进行修改。

```typescript
interface I {
  ...;
  a: number;
};
const defaultValue = {
  ...
  a: -1
};

const factory = (raw: number, observe: I) => {
  observe.a = raw;
}

const oiInstance = oi(requestNumber, factory, defaultValue);
await oiInstance.init(); // { ..., a: 777 }
defaultValue; // { ..., a: 777 }
```

> 如果你不传入默认值，则 `observe ` 的类型会被视为 `I | undefined` ，此时需要进行 `observe` 的类型判断才能修改 `observe`；

### onLoading

当某一次 `Promise` 开始执行和结束执行的时候，会触发 `onLoading` 事件。

```typescript
oiInstance.onLoading((event: boolean) => {
  if (event === "true") {
    console.log("promise function start");
  } else {
    console.log("promise function done");
  }
});

await oiInstance.init(); // promise function start
/** after promise done */
// promise function done
```

```typescript
/** only one console log will be output */
oiInstance.init(); // promise function start
oiInstance.init();
oiInstance.init();
oiInstance.init();
oiInstance.init();
/** after promise done */
// promise function done;
```

### OnceInit

你还可以使用继承抽象类的方式，来实现底层的 `once-init` 。如果使用 `Typescript` ，则还需要定义实例的值的类型。

> 以下是尚未更新的历史文档

---

> 例如，此处定义类型为 `number` 。

```typescript
class OnceInitInstance extends OnceInit<number> {
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
const oiInstance = new OnceInitInstance(-1);
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
