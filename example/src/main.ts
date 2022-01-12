import "./style.scss";
import "./oi";
import "./mock";

const info = document.getElementById("info") as HTMLDivElement;
const cardEle = document.getElementById("app") as HTMLDivElement;
const contentEle = document.getElementById("content") as HTMLDivElement;
const chineseEle = document.getElementById("chinese") as HTMLSpanElement;
const englishEle = document.getElementById("english") as HTMLSpanElement;

const setEnglish = () => {
  cardEle.className = "";
  setTimeout(() => {
    contentEle.className = "";
    info.innerHTML = `
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
  }, 700);
};

setEnglish();
const setChinese = () => {
  cardEle.className = "ani";
  setTimeout(() => {
    contentEle.className = "ani";
    info.innerHTML = `
      <h3>打开浏览器开发工具并检查控制台 console</h3>
      <p class="tip">
        由于请求被Mockjs劫持, 开发工具的Network面板上不会显示发出的请求。
      </p>
      <p class="tip">你可以在 console 面板中访问到 window.oi 属性</p>
      <h4>尝试快速频繁地点击下面的两个按钮，看看区别</h4>
      <p class="tip" style="text-decoration: underline">
        oi封装的请求在请求的pending阶段不会二次触发。
      </p>
`;
  }, 700);
};

englishEle.addEventListener("click", setEnglish);
chineseEle.addEventListener("click", setChinese);
