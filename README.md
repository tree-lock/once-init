# xmon-bury [![npm license](https://img.shields.io/npm/l/@xmon/bury.svg?sanitize=true)](https://github.com/darkXmo/bury/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@xmon/bury.svg?sanitize=true)](https://www.npmjs.com/package/@xmon/bury)

**如果你的项目埋点会严重影响到业务代码，是时候考虑使用 @xmon/bury 了**

- 无痕埋点

- 访问调查

- 行为监测

除了必要的添加 eventId，即为项目添加 ID 标识的行为以外，`@xmon/bury` 不会影响到你的业务代码，你只需要添加配置就够了！

页面行为埋点，通过事件监听来进行行为监测，目前可以监控事件包括

1. 点击事件（Click）
2. 页面加载（Load & Unload）
3. 特定行为（Action）
4. Axios 请求（Api）

5. 路由跳转（Router）

## 安装

```bash
# yarn
yarn add @xmon/bury

# npm
npm install @xmon/bury

# pnpm
pnpm install @xmon/bury
```

## Examples

### 监听一般事件（开启监听点击、页面加载，特定行为）

```javascript
// main.js
import { init } from "@xmon/bury";
import config from "./config.js";

const bury = init(config);
```

#### 配置

你需要在 `config` 中指定你要监听的路由，路由对应事件（进入和离开）的 `eventId`。

同时你需要指定埋点的**基础参数**，他们通常是环境，埋点版本以及系统版本，这些**参数都是可选的**。

```javascript
// config.js
import { initUrlMap } from "@xmon/bury";

// 用initUrlMap配置你想要监听的1页面路径和2加载页面，3离开页面的事件ID
initUrlMap([
  {
    path: "/user/:id",
    leave: "eventIdLeavePage", // Leave EventId
    enter: "eventIdEnterPage", // Enter EventId
  },
]);

// 这里填写埋点事件返回值中的额外字段，通常你需要添加以下几个配置信息
const config = {
  environment: process.env.NODE_ENV,
  version: "1.0.0",
};
export default config;
```

### 监听 Router

如果你使用的是 `Vue` 单页面应用，则还需要监听 `Vue-Router` 跳转，因此你还需要传入 `router` 实例作为第 2 个参数

```javascript
import router from "@/router";
// 把router实例注册到bury中
const bury = init(config, router);
```

### 监听 Api

如果你需要监听 `Axios Api` ，则需要封装 `Axios` 实例。

```javascript
import axios from "axios";
import { trackApi } from "@xmon/bury";

const axiosInstance = axios.create({
  ...
});
// 提醒 @xmon/bury 监听 axios示例 发出请求的行为
trackApi(axiosInstance);
```

#### 配置

和页面监听类似，你也需要指定你要监听的 `api` 路径以及对应的 `eventId`。

```javascript
import { initUrlMap, initApiMap } from "@xmon/bury";

initUrlMap([
  ...
]);
// 利用 initApiMap 来配置需要监听的url
initApiMap([
  {
    url: "/v3/search/anime",
    eventId: "eventIdApi",
  },
]);

const config = {
  ...
};
export default config;
```

> 值得注意的是，无论是监听页面加载还是监听 `api`，都会忽略 `query` 参数。

### 监听点击事件

```vue
<img :src="item.image_url" data-bupoint="eventId" />
```

对于需要监听点击事件的元素，添加 `data-bupoint` 属性，并注入 `eventId` 即可。

### 监听特定行为

```javascript
import { track } from "@xmon/bury";
// 对于特定的行为，你需要将行为包装成函数，并配置好eventId，然后再使用track来监听这个函数行为
const increase = track(() => {
  console.log("I am tracked");
}, "eventId");

// track的返回值是你传入的函数，原封不动。
// increase = () => { console.log('I am tracked') }
```

对于行为，你应当使用 `track` 进行封装，第一个参数是要封装的函数，第二个参数是 `eventId` 。

`track` 会在封装后返回被封装的函数。

埋点行为发生在特定行为执行之前。

### 立即触发

当调用 `tracked` 方法时，会立即触发 `Action` 类型埋点回调。

```javascript
import { tracked } from "@xmon/bury";

...
tracked("eventId");
...
```

## 触发埋点事件回调

触发监听行为会同时触发埋点行为，通过 `onBury` 我们可以获取到埋点行为的回调。

**初始化(`init`)之后才能访问到 `instance`、`track`、`trackApi`、`onBury` 等方法，否则会抛出未定义错误**

```javascript
import { onBury } from "@xmon/bury";

// 做好配置之后，你可以使用 onBury 来监听事件
// 一旦 你配置过的url加载或关闭了 OR 你监听的api请求发送了 OR 你监听的事件被调用了 OR 你观察的Dom被点击了 => 就会触发在 onBury 中注册的回调函数
onBury((value) => {
  // 下文中 BuryConfig 中会说明 payload 中包含哪些值
  const buryInfo = value.payload;
  // 下面是我的埋点回调示例行为，你应当用你的行为代替示例
  const queries = Object.entries(buryInfo)
    .map(([key, value]) => {
      return key + "=" + encodeURI(value);
    })
    .join("&");
  let img = new Image(1, 1);
  // 请将url改成你的后端埋点系统的API
  img.src = `http://exmapleApi.com/bury?` + queries;
  // 3000ms超时处理
  setTimeout(() => {
    if (img && (!img.complete || !img.naturalWidth)) {
      img.src = "";
    }
  }, 3000);
});
```

每当被监听的事件发生的时候，都会注册在 `onBury` 事件中的回调函数。

在这个例子中，它将会取出回调参数中的 `payload` ，并将它封装并发出 `img` 的 `Get` 请求。

> 由于 `onBeforeUnload` 方法在页面即将关闭时执行，此时无法使用 `Axios` 来发起异步请求。但 `img` 和 `XMLHttpRequest` 同步请求仍然可以执行。

## API

#### init

```typescript
export const init = (config: BuryConfig, router?: VueRouter) => Bury;

// 预配置中的一些配置并没有默认值，可以通过 config 手动添加预设
// 这些参数是 payload 中预定义的。
// 你也可以自定义参数
export interface BuryConfig {
  eventId?: string;
  timestamp?: string;
  ua?: string;
  browser?: "MSIE" | "Firefox" | "Safari" | "Chrome" | "Opera";
  referrer?: string;
  width?: string;
  height?: string;
  ip?: string;
  cityName?: string;
  isPhone?: "phone" | "pc";
  userId?: string;
  pageUrl?: string;
  pageStayTime?: string;
  apiUrl?: string; // 仅在 type === Api 中
}
```

`BuryConfig` 中通过 `"@fingerprintjs/fingerprintjs"` 模块 以及 `"http://pv.sohu.com/cityjson?ie=utf-8"` `Api` 接口获取了一些预设值，它们分别是

1. `timestamp` - 时间戳 - `new Date().getTime()`
2. `ua` - 客户端信息（navigator.userAgent），详情请查看 https://developer.mozilla.org/zh-CN/docs/Web/API/Window/navigator
3. `browser` - 浏览器类型
4. `referrer` - 引用来源 - http://www.ruanyifeng.com/blog/2019/06/http-referer.html
5. `width` - 窗口宽度
6. `height` - 窗口高度
7. `ip` - 客户端 ip 地址
8. `cityName` - 客户端省市名 - 如 “江苏省南京市”
9. `isPhone` - 是否是移动端，如果是，则值为 `phone`
10. `userId` - 客户端设备的唯一标识符 详情请查阅 https://github.com/fingerprintjs/fingerprintjs

例如说，你可以传入 `project`、`version` 和 `environment`。

```javascript
const bury = init({
  project: "projectName",
  version: "v1",
  environment: process.env.NODE_ENV,
});
```

```javascript
const bury = init(config, router);
```

- `config` 预定义参数
- `router` 可选参数，如果要监听 `VueRouter` 跳转的话

### Bury.spy

开启监听模式（生产模式下请不要打开），可以在 `devtools` 的控制台中查看每次触发埋点事件的返回值

```javascript
bury.spy();
```

### initUrlMap

初始化监听的 `url` 的页面路径及其 `eventId` 的数组。

> 所有的 eventId 都会被包含在回调函数参数中的 payload 中

```typescript
interface UrlMap: {
  path: string; // 页面url地址，同VueRouter中的path的定义方式
  enter?: string; // 进入该页面的 EventId
  leave?: string; // 离开该页面的 EventId
}[]
```

- `url` 页面的 `url` 地址，定义遵循 https://github.com/pillarjs/path-to-regexp/tree/v1.7.0 ，通常可以和 `VueRouter` 中的 `path` 参数对照着填。
- `enter` 进入该埋点页面的 `eventId`
- `leave` 离开该埋点页面的 `eventId`

> 关于 `path` https://github.com/pillarjs/path-to-regexp/tree/v1.7.0

### initApiMap

```typescript
interface ApiMap: {
  url: string;  // 接口的url地址
  method?: Method;  // Method ，例如 `GET` `POST` ，如果不定义，则监听该url下的所有 Method
  eventId: string;  // 接口被触发时的 EventId
}[] = [];
```

- `url` 接口的 `url` 地址
- `method` 可选参数 `Method` ，例如 `GET` `POST` ，如果未定义，则监听该 `url` 下的所有 `Method`
- `eventId` 该埋点接口的 `eventId`

### track

对事件进行埋点监听

```typescript
function track<T extends () => any>(fn: T, eventId: string): T;
```

- `fn` 被埋点的方法
- `eventId` 该埋点方法的 `eventId`

为传入的方法埋点，并返回埋完点的方法。

### tracked

立即触发 `Action` 埋点事件

```typescript
function tracked(eventId: string): void;
```

- `eventId` 该埋点事件 ID

### trackApi

对 `Axios` 进行埋点监听

```typescript
function trackApi(axiosInstance: AxiosInstance): void;
```

### onBury

当被埋点的时间触发时的回调函数

```typescript
function onBury(callback: (value: BuryCallBackPayload) => void): void;
```

- `callback` 回调函数

### BuryCallBackPayload

```typescript
interface BuryCallBackPayload {
  type: "Action" | "Click" | "Leave" | "Enter" | "Api";
  payload: BuryConfig;
  extra?:
    | Payload.ActionPayload
    | Payload.ApiPayload
    | Payload.ClickPayload
    | Payload.LoadPayload
    | Payload.RoutePayload;
}
```

- `type` 类型 分别是埋点事件、点击、离开页面、载入页面和接口
- `payload` 负载，除了预定义的配置以外
  - `Enter`
    - `pageUrl` 进入的页面 `url`
  - `Leave`
    - `PageStayTime` 在当前页面停留的时间
    - `pageUrl` 离开的页面 `url`
  - `Api`
    - `apiUrl` 接口的 `url`
- `extra` 监听事件的负载，详情请查看 https://github.com/darkXmo/monitor

## help

### 如何在 Nuxt2 项目中使用

#### plugins

在 `plugins` 文件夹中创建文件 `bury.js` 或 `bury.ts` ;

```typescript
// bury.js
import { init, initUrlMap } from '@xmon/bury';

const bury = init({
  version: 'projectVersion',
  dataPointVersion: 'v1',
  project: 'projectName'
});

initUrlMap([{
  path: "/",
  enter: "EnterEventPoint",
  leave: "LeaveEventPoint"
}, ...])

bury.spy();

bury.onBury((value) => {
  // do something with value
})
```

在 `nuxt.config.js` 或 `nuxt.config.ts` 中添加插件配置

```javascript
{
  plugins: [
    ...
    { src: "@/plugins/bury.ts", mode: 'client' },
    ...
  ],
}
```

## TODO

🚀 已完成

| 事项                                                                               | 状态 |
| ---------------------------------------------------------------------------------- | ---- |
| 添加 `tracked` 语法糖，当运行`tracked()`时，就会触发埋点事件，而不需要单独封装行为 | 🚀   |
| 添加配置可选择关闭全局点击事件监听                                                 | 📝   |
| 添加配置可根据页面开启全局点击事件监听                                             | 📝   |
| 如果未检测到需要监听的页面路由，则不开启路由监听                                   | 📝   |
| 可开启监听页面 Web 指标，详情请参考 web-vitals                                     | 📝   |
| 可开启监听页面 Error 事件                                                          | 📝   |
| 可以配置项中的部分默认内容，以加速埋点实例的创建（例如 ip + cityName, userId）     | 📝   |
