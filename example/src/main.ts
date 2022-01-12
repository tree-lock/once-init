import "./style.scss";
import "./mock";

const card = document.getElementById("app") as HTMLDivElement;

card.innerHTML = `
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

card.innerHTML = `
  <h3>打开浏览器开发工具并检查控制台 console</h3>
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
