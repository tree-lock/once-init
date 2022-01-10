import oi from "once-init";

let time = 0;
setInterval(() => {
  console.log(++time);
}, 1000);
const ans = oi(
  (num1: number, num2: number = 100) =>
    new Promise<number>((res) => {
      console.log("Promise started");
      setTimeout(() => {
        throw new Error("Error");
      }, 10000);
    }),
  100
);
const a = ans.target;
