import { setup, mock, Random } from "mockjs";
setup({
  timeout: "1500",
});
mock(/\/example\/.*/, "get", () => Random.int(0, 10000));
