import { e as E, a as y, m as u } from "./vendor.f8cb4ef9.js";
const v = function () {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload")) return;
  for (const n of document.querySelectorAll('link[rel="modulepreload"]')) i(n);
  new MutationObserver((n) => {
    for (const o of n)
      if (o.type === "childList")
        for (const r of o.addedNodes)
          r.tagName === "LINK" && r.rel === "modulepreload" && i(r);
  }).observe(document, { childList: !0, subtree: !0 });
  function s(n) {
    const o = {};
    return (
      n.integrity && (o.integrity = n.integrity),
      n.referrerpolicy && (o.referrerPolicy = n.referrerpolicy),
      n.crossorigin === "use-credentials"
        ? (o.credentials = "include")
        : n.crossorigin === "anonymous"
        ? (o.credentials = "omit")
        : (o.credentials = "same-origin"),
      o
    );
  }
  function i(n) {
    if (n.ep) return;
    n.ep = !0;
    const o = s(n);
    fetch(n.href, o);
  }
};
v();
function m() {
  var t = [].slice.call(arguments);
  if (!(t[0] instanceof Function) || t.length > 3 || t.length < 1)
    throw new Error("Arguments of oi is not supported");
  const e = t[0];
  if (t.length === 1)
    return new (class extends c {
      constructor(...n) {
        super(...n), (this.initPromise = e);
      }
    })();
  if (t.length === 2) {
    if (t[1] instanceof Function) {
      const n = t[1];
      return new (class extends c {
        constructor(...o) {
          super(...o), (this.initPromise = e), (this.factory = n);
        }
      })();
    }
    {
      const n = t[1];
      return new (class extends h {
        constructor(...o) {
          super(...o), (this.initPromise = e);
        }
      })(n);
    }
  }
  const s = t[1],
    i = t[2];
  return new (class extends h {
    constructor(...n) {
      super(...n), (this.initPromise = e), (this.factory = s);
    }
  })(i);
}
class c {
  constructor() {
    (this.observe = void 0),
      (this.promise = null),
      (this.initialized = !1),
      (this.emitter = E()),
      (this.refresh = (() => {
        var e = this;
        return function () {
          try {
            const s = arguments;
            if (e.promise)
              return Promise.resolve(e.promise.finally(() => e.observe));
            {
              (e.promise = e.initPromise(...[].slice.call(s))),
                e.emitter.emit("loading", !0);
              const i = e.factory;
              return Promise.resolve(e.promise).then(function (n) {
                const o = i.call(e, n, e.observe);
                return (
                  o != null && (e.observe = o),
                  (e.promise = null),
                  (e.initialized = !0),
                  e.emitter.emit("loading", !1),
                  e.observe
                );
              });
            }
          } catch (s) {
            return Promise.reject(s);
          }
        };
      })());
  }
  factory(e, s) {
    return e;
  }
  get target() {
    return (
      this.initialized || this.initPromise.length !== 0 || this.refresh(),
      this.observe
    );
  }
  init() {
    try {
      let i = function () {
        return e.observe;
      };
      const e = this,
        s = arguments;
      if (e.promise) return Promise.resolve(e.promise.finally(() => e.observe));
      const n = (function () {
        if (!e.initialized)
          return Promise.resolve(e.refresh(...[].slice.call(s))).then(
            function () {}
          );
      })();
      return Promise.resolve(n && n.then ? n.then(i) : i());
    } catch (e) {
      return Promise.reject(e);
    }
  }
  onLoading(e) {
    this.emitter.on("loading", e);
  }
}
class h extends c {
  get target() {
    return (
      this.initialized || this.initPromise.length !== 0 || this.refresh(),
      this.observe
    );
  }
  constructor(e) {
    super(), (this.observe = e);
  }
}
const l = y.create();
let B = 0;
l.interceptors.request.use(
  (t) => {
    console.log(
      "%c\u{1F6F8} [Axios] Send API Request => ",
      "color: #2563eb; ",
      t.url
    );
    const s = document.getElementById("count");
    return (s.innerText = (++B).toString()), t;
  },
  (t) => Promise.reject(t)
);
l.interceptors.response.use(
  (t) => (
    console.log(
      "%c\u{1F6F8} [Axios] Received API Response => ",
      "color: #378362; ",
      t.config.url
    ),
    t
  )
);
let a = 0;
const F = async () => {
  const t = document.getElementById("status");
  (t.innerText = "pending"), a++;
  const e = await l.get("/example");
  return a--, a === 0 && (t.innerText = "done"), e.data;
};
var p = { count: F };
window.oi = m;
const b = p.count,
  x = m(p.count).refresh,
  k = document.getElementById("common"),
  w = document.getElementById("oi");
k.addEventListener("click", () =>
  b().then((t) => {
    document.getElementById("value").innerText = t.toString();
  })
);
w.addEventListener("click", () =>
  x().then((t) => {
    document.getElementById("value").innerText = t.toString();
  })
);
u.exports.setup({ timeout: "1200-1600" });
u.exports.mock("/example", "get", () => u.exports.Random.int(0, 1e4));
const d = document.getElementById("info"),
  f = document.getElementById("app"),
  g = document.getElementById("content"),
  P = document.getElementById("chinese"),
  C = document.getElementById("english");
d.innerHTML = `
      <h3>Open chrome devtool and check the console.</h3>
      <p class="tip">
        Due to the request is intercepted by mockjs, you cannot check XHR
        request at network panel
      </p>
      <p class="tip">window.oi is accessible at console panel in devtool.</p>
      <h4>Try to Click button frequently, Check the Difference.</h4>
      <p class="tip" style="text-decoration: underline">
        oi packaged request will not be sent if request status pending
      </p>
`;
const A = () => {
    (f.className = ""),
      setTimeout(() => {
        (g.className = ""),
          (d.innerHTML = `
      <h3>Open chrome devtool and check the console.</h3>
      <p class="tip">
        Due to the request is intercepted by mockjs, you cannot check XHR
        request at network panel
      </p>
      <p class="tip">window.oi is accessible at console panel in devtool.</p>
      <h4>Try to Click button frequently, Check the Difference.</h4>
      <p class="tip" style="text-decoration: underline">
        oi packaged request will not be sent if request status pending
      </p>
`);
      }, 700);
  },
  q = () => {
    (f.className = "ani"),
      setTimeout(() => {
        (g.className = "ani"),
          (d.innerHTML = `
      <h3>\u6253\u5F00\u6D4F\u89C8\u5668\u5F00\u53D1\u5DE5\u5177\u5E76\u68C0\u67E5\u63A7\u5236\u53F0 console</h3>
      <p class="tip">
        \u7531\u4E8E\u8BF7\u6C42\u88ABMockjs\u52AB\u6301, \u5F00\u53D1\u5DE5\u5177\u7684Network\u9762\u677F\u4E0A\u4E0D\u4F1A\u663E\u793A\u53D1\u51FA\u7684\u8BF7\u6C42\u3002
      </p>
      <p class="tip">\u4F60\u53EF\u4EE5\u5728 console \u9762\u677F\u4E2D\u8BBF\u95EE\u5230 window.oi \u5C5E\u6027</p>
      <h4>\u5C1D\u8BD5\u5FEB\u901F\u9891\u7E41\u5730\u70B9\u51FB\u4E0B\u9762\u7684\u4E24\u4E2A\u6309\u94AE\uFF0C\u770B\u770B\u533A\u522B</h4>
      <p class="tip" style="text-decoration: underline">
        oi\u5C01\u88C5\u7684\u8BF7\u6C42\u5728\u8BF7\u6C42\u7684pending\u9636\u6BB5\u4E0D\u4F1A\u4E8C\u6B21\u89E6\u53D1\u3002
      </p>
`);
      }, 700);
  };
C.addEventListener("click", A);
P.addEventListener("click", q);
