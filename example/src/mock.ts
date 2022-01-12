import Mock from "mockjs";
Mock.setup({
  timeout: "1200-1600",
});
Mock.mock("/example", "get", () => Mock.Random.int(0, 10000));
