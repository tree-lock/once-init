import { m as n } from "./vendor.1013f282.js";
const c = function () {
  const s = document.createElement("link").relList;
  if (s && s.supports && s.supports("modulepreload")) return;
  for (const e of document.querySelectorAll('link[rel="modulepreload"]')) i(e);
  new MutationObserver((e) => {
    for (const t of e)
      if (t.type === "childList")
        for (const o of t.addedNodes)
          o.tagName === "LINK" && o.rel === "modulepreload" && i(o);
  }).observe(document, { childList: !0, subtree: !0 });
  function a(e) {
    const t = {};
    return (
      e.integrity && (t.integrity = e.integrity),
      e.referrerpolicy && (t.referrerPolicy = e.referrerpolicy),
      e.crossorigin === "use-credentials"
        ? (t.credentials = "include")
        : e.crossorigin === "anonymous"
        ? (t.credentials = "omit")
        : (t.credentials = "same-origin"),
      t
    );
  }
  function i(e) {
    if (e.ep) return;
    e.ep = !0;
    const t = a(e);
    fetch(e.href, t);
  }
};
c();
n.exports.setup({ timeout: "1200-1600" });
n.exports.mock("/example", "get", () => n.exports.Random.int(0, 1e4));
const u = document.getElementById("app");
u.innerHTML = `
  <h3>Open chrome devtool and check the console.</h3>
  <p class="tip">
    Due to the request is intercepted by mockjs, you cannot check XHR
    request at network panel
  </p>
  <p class="tip">window.oi is accessible at console panel in devtool.</p>
  <h4>Click button frequently.</h4>
  <div class="operations">
    <span>Send Request by</span>
    <button id="common" class="common">common request</button>
    /
    <button id="oi" class="oi">oi packaged request</button>
  </div>
  <p>Request Status [ <span id="status">sleep</span> ]</p>
  <p class="content">value: <span class="value" id="value">0</span></p>
  <p>Request Sent Count <span id="count">0</span></p>
  <p class="tip" style="text-decoration: underline">
    oi packaged request will not be sent if request status pending
  </p>
`;
u.innerHTML = `
  <h3>\u6253\u5F00\u6D4F\u89C8\u5668\u5F00\u53D1\u5DE5\u5177\u5E76\u68C0\u67E5\u63A7\u5236\u53F0 console</h3>
  <p class="tip">
    Due to the request is intercepted by mockjs, you cannot check XHR
    request at network panel
  </p>
  <p class="tip">window.oi is accessible at console panel in devtool.</p>
  <h4>Click button frequently.</h4>
  <div class="operations">
    <span>Send Request by</span>
    <button id="common" class="common">common request</button>
    /
    <button id="oi" class="oi">oi packaged request</button>
  </div>
  <p>Request Status [ <span id="status">sleep</span> ]</p>
  <p class="content">value: <span class="value" id="value">0</span></p>
  <p>Request Sent Count <span id="count">0</span></p>
  <p class="tip" style="text-decoration: underline">
    oi packaged request will not be sent if request status pending
  </p>
`;
