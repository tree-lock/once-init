# once-init

<p align="center">
  <a href="https://github.com/darkXmo/once-init/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/once-init.svg?sanitize=true" alt="npm"></a>
  <a href="https://www.npmjs.com/package/once-init"><img src="https://img.shields.io/npm/v/once-init.svg?sanitize=true" alt="gzip size"></a>
</p>

<strong style="text-align: center;">🗼 Let Promise Function Executed Only Once.</strong>

只会被初始化一次的 `Promise` 函数。

> 第一次调用对象的时候会执行 `Promise` 函数初始化，重复调用，初始化将不会再次执行。

> 同一个 `Promise` 不会在同一时间内被执行两次。

[精简版 Github 仓库(不包括`factory`和`onLoading`)](https://github.com/darkXmo/oinit)
[中国镜像](https://gitee.com/dXmo/once-init)

## 承诺

1. **`OnceInit` 封装的 `Promise Function` ，永远不会在同一时间被执行两次。**
2. 如果上一个 `Promise Function` 没有执行完成就调用了下一个 `Promise Function` ，那么下一个 `Promise Function` 将共享上一个`Promise Function` 的 `Promise`。
3. [示例网站](https://darkxmo.github.io/once-init)

## Install

使用包管理工具安装, 推荐使用`pnpm`;

```bash
npm install once-init
```

OR

```bash
yarn add once-init
```

OR

```bash
pnpm add once-init
```

## Usage

例如, 在 `once-init` 搭配 `axios` 使用;

> 假设 `res` 的返回值为 `any` ;

```typescript
import oi from "once-init";
const request = async () => {
  const res: AxiosResponse<any> = await axiosInstance.get("/api");
  return res.data;
};
oi(request, -1);

oi.target; // -1

await oi.init(); // [Axios Response Data Value] (any)
await oi.refresh(); // [Axios Response Data Value] (any)

await oi.init(); // [No Axios Request Sent] (any)
oi.target; // (any)

oi.refresh().then((res) => {
  console.log(res); // [Axios Response Data Value] (any)
});
oi.refresh().then((res) => {
  console.log(res); // [Previous Axios Response Data Value] (any)
});
```

## Apis

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
/** asynchronous executing */
async function functionC() {
  await functionA();
  await functionB();
}
/** Synchronous executing */
function functionD() {
  functionA();
  functionB();
}
```

对于 `functionC`， 在**第一次执行 `init` 之后**，`oiInstance` 将会保存 `Promise` 的执行结果，此后再执行 `init` ，将**不会再发出 `Promise` 请求**。

对于 `functionD`， `api` 请求只会发送一次，`functionA` 和 `functionB` 中的 `res` 都将等待**同一个请求**的返回值，不会发送重复的请求。

这个示例能帮助你更好地理解

```typescript
const requestNumber = async () => {
  console.log("Load");
  const res: AxiosResponse<number> = await axiosInstance.get("/api/number");
  return res.data;
};
const oiInstance = oi(requestNumber);
/** only One Promise will be executed */
/** only One 'Load' will be output on console */
oiInstance.init().then((res) => {
  console.log(res); // [Promise Return Value] 777
});
oiInstance.init().then((res) => {
  console.log(res); // [Promise Return Value] 777
});
```

```typescript
const requestNumber = async () => {
  console.log("Load");
  const res: AxiosResponse<number> = await axiosInstance.get("/api/number");
  return res.data;
};
const oiInstance = oi(requestNumber);
/** only One Promise will be executed */
/** only One 'Load' will be output on console */
await oiInstance.init();
await oiInstance.init(); // since the value has been initialized, it will return value immediately
```

### target

`target` 属性能同步获取返回值。

```typescript
function functionE() {
  ...
  const res = oiInstance.target;
  ...
}
```

如果在获取 `target` 之前已经完成初始化，`target` 的值为 `Promise` 的返回值，否则，`target` 的值为 `undefined` 。例如，

```typescript
const res = oiInstance.target; // undefined
```

```typescript
await oiInstance.init();

const res = oiInstance.target; // [Return Value] 777
```

请注意，虽然是同步获取，但 `once-init` 仍然会认为你此时需要发出请求，因此调用 `target` 属性也会开始初始化。

> 但如果 `Promise Function` 是带参数的 `Function` ，则不会执行初始化。

我们假设 `api` 的请求时长是 `10s` 。在下面这个例子里，请求在第一行的时候就已经发出。

```typescript
const res = oiInstance.target; // undefined
/** Promise has been executed. */
setTimeout(async () => {
  const resAfter = oiInstance.target; // [Return Value] 777
  const intAffter = await oiInstance.init(); // [Return Value] 777 , Promise will not be executed again.
  /** Since The Promise has been executed before, it will not be executed again. */
}, 10001);
```

和同时先后同步执行两次 `init` 一样，假如在获取 `init` 之前访问了 `target` 属性，而 访问 `target` 导致的 `Promise` 请求没有结束的话，`init` 将直接等待上一个 `Promise` 结束并返回上一个 `Promise` 的返回值 。

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

这里的 `init` 将会等待上一个 `Promise` 函数执行的返回值，由于 `init` 是在 `200ms` 之后才执行的，所以它只需要再等待大约 `800ms` 就能获得这个返回值了。

### defaultValue

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

刷新之后，调用 `init` 和 `target` 获取的值会变成新的值。

```typescript
oiInstance.target; // undefined
await oiInstance.init(); // [Promise Retrun Value] 777
oiInstance.target; // 777
await oiInstance.refresh(); // [Promise Retrun Value] 888
oiInstance.target; // 888 /** Promise will not be exectued again */
await oiInstance.init(); // 888 /** Promise will not be exectued again */
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

```typescript
oiInstance.refresh((res) => {
  console.log(res); // [Promise Retrun Value] 777
});
oiInstance.refresh((res) => {
  console.log(res); // [Promise Retrun Value] 777
});
```

我们仍然假设 `api` 请求的时长为 `10s === 10000ms` 。

```typescript
oiInstance.refresh();
setTimeout(async () => {
  await oiInstance.refresh();
}, 2000);
/** After 10000ms, two refresh will be exected at the same time */
```

如果异步先后调用了两次 `refresh` ，那么发送两次请求，和用`oi`封装前的 `Promise Function` 的执行效果一致。

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

### Param

`Promise Function` 允许传递任意参数，需要注意的是，如果在第一个 `Promise` 执行期间，通过 `api` 传入了多个不同的参数，那么只会得到第一个参数的 `Promise` 的结果。

假设 `/api/abs` 的返回值是 `param` 的绝对值，执行时间为 `10s === 10000ms` 。

```typescript
const oiInstance = oi(async (param: number) => {
  const response: AxiosResponse<number> = await axios.get("/api/abs/" + param);
  return response.data;
}, 0);

await oiInstance.init(-10); // [Promise Return Value] 10
/** Only the first promise will be executed */
oiInstance.refresh(-888).then((res) => {
  console.log(res); // [Promise Retrun Value] 888
});
/** The rest params will be ignored */
oiInstance.refresh(-777).then((res) => {
  console.log(res); // [Promise Retrun Value] 888
});
```

### factory

如果 `Promise` 的返回值需要加工，可以传入 `factory` 参数来实现加工。

例如，`api` 传递过来的数据是一个时间戳，而希望获得返回值是一个 `Date` 对象。

```typescript
const ans = await oiInstance.init(); // [Timestamp] 1640673370941
const wishAns = new Date(ans);
```

你可以传入一个 `factory` 函数作为参数，让 `Promise Function` 在执行 `Promise` 完成之后，自动加工为新的值。

```typescript
const factory = (raw: number) => new Date(raw);
const oiInstance = oi(requestTimeStamp, factory);

const ans = await oiInstance.init(); // [Promise Return Value] Date
```

你仍然可以传入默认值，作为第三个参数，但它的类型应当是 `factory` 的返回值的类型。

```typescript
const oiInstance = oi(requestTimeStamp, factory, new Date());
```

如果 `Promise` 的返回值只是某个对象的一部分，你还可以用 `factory` 的第二个参数来对对象进行局部修改。

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

> 详情请查看源码，绝大多数情况，你不需要自己来实现抽象类

---

> 例如，此处定义类型为 `number` 。

```typescript
class OnceInitInstance extends OnceInit<number> {
  protected initPromise(): Promise<number> {
    const res: AxiosResponse<number> = await axiosInstance.get("/api/number");
    return res.data;
  }
}
const oiInstance = new OnceInitInstance(-1);

console.log(numberInstance.target); // -1

setTimeout(() => {
  console.log(numberInstance.target); // 777
}, 10000);

numberInstance.init().then(() => {
  console.log(numberInstance.target); // [Promise Return Value] 777
});
```
