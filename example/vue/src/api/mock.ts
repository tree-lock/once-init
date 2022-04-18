import { setup, mock, Random } from "mockjs";
setup({
  timeout: "2000",
});
mock(/\/example\/.*/, "get", () => Random.int(0, 10000));
