import { setup, mock, Random } from "mockjs";
setup({
  timeout: "1200-1600",
});
mock("/example", "get", () => Random.int(0, 10000));
