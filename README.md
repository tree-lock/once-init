# once-init

<p align="center">
  <a href="https://github.com/darkXmo/once-init/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/once-init.svg?sanitize=true" alt="license"></a>
  <a href="https://www.npmjs.com/package/once-init"><img src="https://img.shields.io/npm/v/once-init.svg?sanitize=true" alt="npm version"></a>
  <a href="https://circleci.com/gh/darkXmo/once-init"><img src="https://circleci.com/gh/darkXmo/once-init.svg?style=shield" alt="circleci"></a>
  <a href="https://app.codecov.io/gh/darkXmo/once-init"><img src="https://badgen.net/codecov/c/github/darkXmo/once-init" alt="test-coverage"></a>
  <a href="https://packagephobia.now.sh/result?p=once-init"><img src="https://badgen.net/packagephobia/install/once-init" alt="gzip size"></a>
  <a target="_blank" rel="noopener noreferrer nofollow" href="https://camo.githubusercontent.com/0f9fcc0ac1b8617ad4989364f60f78b2d6b32985ad6a508f215f14d8f897b8d3/68747470733a2f2f62616467656e2e6e65742f62616467652f547970655363726970742f7374726963742532302546302539462539322541412f626c7565" data-turbo-frame=""><img src="https://camo.githubusercontent.com/0f9fcc0ac1b8617ad4989364f60f78b2d6b32985ad6a508f215f14d8f897b8d3/68747470733a2f2f62616467656e2e6e65742f62616467652f547970655363726970742f7374726963742532302546302539462539322541412f626c7565" alt="badge" data-canonical-src="https://badgen.net/badge/TypeScript/strict%20%F0%9F%92%AA/blue" style="max-width: 100%;"></a>
</p>

<strong style="text-align: center;">🗼 Makes asynchronous function execution manageable.</strong>

封装可控的 `async function`。

> 你可以让同一个 `async function` 不会在同一时间内被执行两次，以防止发出重复的请求。

> 你可以让第二次执行 `async function` ，直接返回第一次执行的结果，而不是重复执行函数。

> 解决大量的相同请求的问题。

> 详细且精确的 `Typescript` 检查。

## 安装

```bash
# 浏览器环境和nodejs环境都可用
npm install once-init
```

```html
<script src="/index.js"></script>
<script>
  OnceInit.oi(async () => { ... });
</script>
```

## 简介

`once-init` 的核心思想是缓存和执行队列；

## 使用

```typescript
// 0. 引入once-init
import oi from "once-init";

// 1. 创建一个异步函数
async function foo() {
  // do something, for example, request backend data.
  const res = await axios.get("xxx.com");
  return res;
}

// 2. 用once-init封装这个异步函数
const oiFoo = oi(foo);

// 3. 执行封装后的函数
oiFoo.init();
```

通常来说，`axios.get` 请求很适合进行封装，你可以用`refresh`来代替原来的 `axios.get` 实现无感处理重复请求。

只需要下面这一行：

```typescript
axios.get = oi(axios.get).refresh as typeof axios.get;
```

### 用例

#### 不用 `once-init`

```typescript
// 我们假设 axios.get("xxx.com") 返回的值是一个递增的数字，即第1次请求，会返回1，第2次请求会返回2，第n次请求会返回n。
await foo(); // 返回 1
await foo(); // 返回 2
await foo(); // 返回 3
```

#### 使用 `once-init`

```typescript
// once-init 会将重复执行重定向到第一次执行的结果上；（第一次执行后会缓存执行结果，类似单例模式）
await oiFoo.init(); // 返回 1
await oiFoo.init(); // 返回 1
await oiFoo.init(); // 返回 1
```

这意味着无论重复执行 `oiFoo.init` 多少次，`foo` 都只会执行第一次，返回第一次执行的结果；（就像缓存一样）

```typescript
await Promise.all([oiFoo.init(), oiFoo.init(), oiFoo.init()]); // 返回 [1, 1, 1]
await Promise.all([oiFoo.init(), oiFoo.init(), oiFoo.init()]); // 返回 [1, 1, 1]
```

```typescript
// 通常，如果你只会使用到init，你可以直接把 oiFoo 定义成 init 函数
const oiFoo = oi(foo).init;

await oiFoo();
```

如果你不使用缓存，只是希望防止同一时间发出重复请求，你可以使用`refresh`：

```typescript
// refresh和init在同一时间执行多次，都会阻止重复执行，多余的async function会返回第一次的结果；
await Promise.all([oiFoo.refresh(), oiFoo.refresh(), oiFoo.refresh()]); // 返回 [1, 1, 1]
// 但refresh如果当前没有其它重复的async function在执行，会刷新结果，并同时刷新缓存（影响到下一次init的返回）；
await Promise.all([oiFoo.refresh(), oiFoo.refresh(), oiFoo.refresh()]); // 返回 [2, 2, 2]
await oiFoo.init(); // 返回 2
```

> `once-init` 会区分参数，如果传入的异步函数有参，那么传入不同的参数将被视为两个不同的异步函数，不会共享缓存和执行队列；（使用`lodash.isEqual`判断参数是否相等）

下面这个复杂用例将会给你提供灵感：

```typescript
// 假设 xxx.com/+ 会返回正数， xxx.com/- 会返回负数，两者有独立的缓存，且绝对值都递增
async function foo(op: "+" | "-") {
  const res = await axios.get(`xxx.com/${op}`);
  return res;
}

const oiFoo = oi(foo);
await oiFoo.init("-"); // 返回 -1
await oiFoo.refresh("-"); // 返回 -2
await oiFoo.refresh("-"); // 返回 -3

await oiFoo.refresh("+"); // 返回 1
await oiFoo.init("-"); // 返回 -3
```

## api

> `refresh`、`exceed`会刷新`init`的缓存；

> 所有`api`都能接收参数，参数就是封装的源`function`的参数；

在下面的所有例子中：

> 我们假设 `axios.get("xxx.com")` 返回的值是一个递增的数字，即第 1 次请求，会返回`1`，第 2 次请求会返回`2`，第 n 次请求会返回`n`。

> 我们假设 `foo` 的执行时间为 `50ms`；其它时间忽略不计；

### `OnceInit.init`

最常用的`api`，无论你调用多少次，`init`都只会执行一次，并返回给你第一次执行（或缓存中）的结果。

```typescript
async function foo() {
  const res = await axios.get("xxx.com");
  return res;
}

const oiFoo = oi(foo);

await oiFoo.init(); // 50秒后，返回 1
await oiFoo.init(); // 0秒后，返回 1
await oiFoo.init(); // 0秒后，返回 1
```

如果多个 `init` 同时执行（第二次调用的时候，第一次执行还没有完成），则第二次及之后的调用将会等待第一次执行的结果，然后返回第一次执行的结果；

```typescript
setTimeout(oiFoo.init, 30); // 20秒后，执行完毕，返回 1
await oiFoo.init(); // 50秒后，执行完毕，返回 1
```

### `OnceInit.refresh`

`refresh` 刷新 `once-init` 的缓存；如果你在第一次调用 `init` 之后，希望再执行一次 `foo` 更新后端数据，你可以执行 `refresh` 。

`refresh` 之后，再执行 `oiFoo` 将会返回刷新后的数据；

```typescript
async function foo() {
  const res = await axios.get("xxx.com");
  return res;
}

const oiFoo = oi(foo);

await oiFoo.init(); // 50秒后，返回 1 （无缓存，所以执行）
await oiFoo.refresh(); // 50秒后，返回 2
// refresh 会刷新 init 的缓存
await oiFoo.init(); // 0秒后，返回 2 （已有缓存，所以不会执行）
await oiFoo.refresh(); // 50秒后，返回 3
```

> **如果`refresh`正在刷新，则在`refresh`结束前执行的`init`也会`refresh`结束结束后再返回值，而不会直接返回旧的缓存结果。**

多个 `refresh` 如果在同一时间里同时调用，只会执行一次，并返回第一次执行的结果。【如果你希望同一时间里同时执行，会执行多次，请使用 `exceed` 】

```typescript
setTimeout(oiFoo.refresh, 30); // 20秒后，执行完毕，返回 1
await oiFoo.refresh(); // 50秒后，执行完毕，返回 1
```

`refresh` 和 `init` 共享一个执行队列，这意味着如果 `init` 和 `refresh` 同时执行，也将只会执行一次并返回第一次执行的结果；

```typescript
setTimeout(oiFoo.refresh, 30); // 20秒后，执行完毕，返回 1
await oiFoo.init(); // 50秒后，执行完毕，返回 1
```

### `OnceInit.get`

`get` 是 `init` 的同步版本，相当于获取缓存；如果有缓存的值，那么 `get` 会返回缓存值；如果没有，则会返回 `undefined`。

```typescript
oiFoo.get(); // 返回 undefined （从未执行过，所以没有缓存）

await oiFoo.init(); // 50秒后，返回 1
oiFoo.get(); // 返回 1
```

### `OnceInit.execute`

`execute` 会直接执行源函数，它既不会修改缓存，也不会插入执行队列。

```typescript
await oiFoo.init(); // 50秒后，返回 1
await oiFoo.execute(); // 50秒后，返回 2
await oiFoo.init(); // 0秒后，返回 1 （缓存未更新）
await oiFoo.refresh(); // 50秒后，返回 3 （缓存更新，重新获取后端值，由于后端在上次execute请求中虽未更新缓存，但更新了后端，所以返回值为3）
```

### `OnceInit.wait`

如果当前异步函数正在执行，`wait`会等待直到结束，如果异步函数没有执行，则立即返回。

`wait` 没有返回值；

```typescript
await oiFoo.wait(); // 等待0秒

oiFoo.init();
oiFoo.get(); // 返回 undefined
await oiFoo.wait(); // 等待50秒
oiFoo.get(); // 返回 1
```

### `OnceInit.exceed`

!!! 这是一个会造成理解困难的函数，**请尽量不要和其它 api 混合使用**；

`exceed` 会强制执行函数，无论现在是否正在执行另一个相同的异步函数。

`exceed` 也会刷新缓存。

`refresh` 和 `init` 的执行受 `exceed` 影响，但 `exceed` 的执行不受 `refresh` 和 `init` 的影响；

```typescript
await Promise.all([oiFoo.exceed(), oiFoo.exceed(), oiFoo.exceed()]); // 50秒后，返回 [1, 2, 3];

// exceed 会刷新缓存
await oiFoo.init(); // 0秒后，返回 3
await oiFoo.refresh(); // 50秒后，返回 4
```

如果 `exceed` 正在执行， `refresh` 和 `init` 将会返回 `exceed` 执行的结果；

> **_注意(WARNING)_**: 如果你不断地执行 `exceed` ，会导致执行队列不断地刷新，而同一时间执行的 `refresh` 和 `init` 将返回你**执行 `init` 和 `refresh` 前最后一次执行**的`exceed`的结果。

> 不推荐你短时间多次调用 `exceed` ，它可能让你对返回结果造成困扰；大多数情况下，`refresh` 和 `execute` 会是更好的替代品。

请在理解下面这个例子的前提下在实际应用场景中应用 `exceed` 。

```typescript
await Promise.all([oiFoo.refresh(), oiFoo.exceed()]); // 50秒后，返回 [1, 2];

await Promise.all([oiFoo.exceed(), oiFoo.refresh()]); // 50秒后，返回 [3, 3];

await Promise.all([oiFoo.exceed(), oiFoo.refresh(), oiFoo.init()]); // 50秒后，返回 [4, 4, 3];

await oiFoo.init(); // 0秒后，返回 4

await Promise.all([
  oiFoo.exceed(),
  oiFoo.refresh(),
  oiFoo.exceed(),
  oiFoo.refresh(),
  oiFoo.init(),
]); // 50秒后，返回 [5, 5, 6, 6, 4];
```

![Alt](https://repobeats.axiom.co/api/embed/3e2a2caafe9c373cbe8fa4a16c3fb1b3d2e20fdf.svg "Repobeats analytics image")
