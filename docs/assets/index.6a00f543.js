import { M as c, e as f, a as h } from "./vendor.01000a7d.js";
const g = function () {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload")) return;
  for (const n of document.querySelectorAll('link[rel="modulepreload"]')) s(n);
  new MutationObserver((n) => {
    for (const r of n)
      if (r.type === "childList")
        for (const i of r.addedNodes)
          i.tagName === "LINK" && i.rel === "modulepreload" && s(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function o(n) {
    const r = {};
    return (
      n.integrity && (r.integrity = n.integrity),
      n.referrerpolicy && (r.referrerPolicy = n.referrerpolicy),
      n.crossorigin === "use-credentials"
        ? (r.credentials = "include")
        : n.crossorigin === "anonymous"
        ? (r.credentials = "omit")
        : (r.credentials = "same-origin"),
      r
    );
  }
  function s(n) {
    if (n.ep) return;
    n.ep = !0;
    const r = o(n);
    fetch(n.href, r);
  }
};
g();
c.setup({ timeout: "1200-1600" });
c.mock("/example", "get", () => c.Random.int(0, 1e4));
function p() {
  var t = [].slice.call(arguments);
  if (!(t[0] instanceof Function) || t.length > 3 || t.length < 1)
    throw new Error("Arguments of oi is not supported");
  const e = t[0];
  if (t.length === 1)
    return new (class extends l {
      constructor(...n) {
        super(...n), (this.initPromise = e);
      }
    })();
  if (t.length === 2) {
    if (t[1] instanceof Function) {
      const n = t[1];
      return new (class extends l {
        constructor(...r) {
          super(...r), (this.initPromise = e), (this.factory = n);
        }
      })();
    }
    {
      const n = t[1];
      return new (class extends m {
        constructor(...r) {
          super(...r), (this.initPromise = e);
        }
      })(n);
    }
  }
  const o = t[1],
    s = t[2];
  return new (class extends m {
    constructor(...n) {
      super(...n), (this.initPromise = e), (this.factory = o);
    }
  })(s);
}
class l {
  constructor() {
    (this.observe = void 0),
      (this.promise = null),
      (this.initialized = !1),
      (this.emitter = f()),
      (this.refresh = (() => {
        var e = this;
        return function () {
          try {
            const o = arguments;
            if (e.promise)
              return Promise.resolve(e.promise.finally(() => e.observe));
            {
              (e.promise = e.initPromise(...[].slice.call(o))),
                e.emitter.emit("loading", !0);
              const s = e.factory;
              return Promise.resolve(e.promise).then(function (n) {
                const r = s.call(e, n, e.observe);
                return (
                  r != null && (e.observe = r),
                  (e.promise = null),
                  (e.initialized = !0),
                  e.emitter.emit("loading", !1),
                  e.observe
                );
              });
            }
          } catch (o) {
            return Promise.reject(o);
          }
        };
      })());
  }
  factory(e, o) {
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
      let s = function () {
        return e.observe;
      };
      const e = this,
        o = arguments;
      if (e.promise) return Promise.resolve(e.promise.finally(() => e.observe));
      const n = (function () {
        if (!e.initialized)
          return Promise.resolve(e.refresh(...[].slice.call(o))).then(
            function () {}
          );
      })();
      return Promise.resolve(n && n.then ? n.then(s) : s());
    } catch (e) {
      return Promise.reject(e);
    }
  }
  onLoading(e) {
    this.emitter.on("loading", e);
  }
}
class m extends l {
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
const u = h.create();
let v = 0;
u.interceptors.request.use(
  (t) => {
    console.log(
      "%c\u{1F6F8} [Axios] Send API Request => ",
      "color: #2563eb; ",
      t.url
    );
    const o = document.getElementById("count");
    return (o.innerText = (++v).toString()), t;
  },
  (t) => Promise.reject(t)
);
u.interceptors.response.use(
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
const y = async () => {
  const t = document.getElementById("status");
  (t.innerText = "pending"), a++;
  const e = await u.get("/example");
  return a--, a === 0 && (t.innerText = "done"), e.data;
};
var d = { count: y };
const P = d.count,
  x = p(d.count).refresh,
  b = document.getElementById("common"),
  E = document.getElementById("oi");
b.addEventListener("click", () =>
  P().then((t) => {
    document.getElementById("value").innerText = t.toString();
  })
);
E.addEventListener("click", () =>
  x().then((t) => {
    document.getElementById("value").innerText = t.toString();
  })
);
