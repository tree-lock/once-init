import oi, { OnceInit } from "../src/index";
/** val每增加1表示执行一次 */
let val: number = 0;
const runPromise = () => {
  return new Promise<number>((res) => {
    setTimeout(() => {
      res(++val);
    }, 10);
  });
};
describe("初始化", () => {
  test("测试Promise", async () => {
    expect(await runPromise()).toBe(val);
    expect(await runPromise()).toBe(val);
  });
});

describe("测试once-init", () => {
  let oiPromise: OnceInit<number>;
  /** 重置val和oiPromise */
  beforeEach(() => {
    oiPromise = oi(runPromise);
    val = 0;
  });

  describe("单独测试", () => {
    test("normal", async () => {
      const res = await Promise.all([
        runPromise(),
        runPromise(),
        runPromise(),
        runPromise(),
      ]);
      expect(res[0]).toBe(1);
      expect(res[1]).toBe(2);
      expect(res[2]).toBe(3);
      expect(res[3]).toBe(4);
    });

    test("init", async () => {
      const res = await Promise.all([
        oiPromise.init(),
        oiPromise.init(),
        oiPromise.init(),
        oiPromise.init(),
      ]);
      expect(res[0]).toBe(1);
      expect(res[0]).toBe(res[1]);
      expect(res[1]).toBe(res[2]);
      expect(res[2]).toBe(res[3]);
    });

    test("refresh", async () => {
      const res = await Promise.all([
        oiPromise.refresh(),
        oiPromise.refresh(),
        oiPromise.refresh(),
        oiPromise.refresh(),
      ]);
      expect(res[0]).toBe(1);
      expect(res[0]).toBe(res[1]);
      expect(res[1]).toBe(res[2]);
      expect(res[2]).toBe(res[3]);
    });

    test("get", async () => {
      const res = await Promise.all([
        oiPromise.get(),
        oiPromise.get(),
        oiPromise.get(),
        oiPromise.get(),
      ]);
      expect(res[0]).toBe(undefined);
      expect(res[0]).toBe(res[1]);
      expect(res[1]).toBe(res[2]);
      expect(res[2]).toBe(res[3]);
    });

    test("exceed", async () => {
      const res = await Promise.all([
        oiPromise.exceed(),
        oiPromise.exceed(),
        oiPromise.exceed(),
        oiPromise.exceed(),
      ]);
      expect(res[0]).toBe(1);
      expect(res[1]).toBe(2);
      expect(res[2]).toBe(3);
      expect(res[3]).toBe(4);
    });

    test("execute", async () => {
      const res = await Promise.all([
        oiPromise.execute(),
        oiPromise.execute(),
        oiPromise.execute(),
        oiPromise.execute(),
      ]);
      expect(res[0]).toBe(1);
      expect(res[1]).toBe(2);
      expect(res[2]).toBe(3);
      expect(res[3]).toBe(4);
    });
  });

  describe("复合测试", () => {
    describe("init + refresh", () => {
      test("init => refresh", async () => {
        const res = await Promise.all([
          oiPromise.init(),
          oiPromise.refresh(),
          oiPromise.refresh(),
          oiPromise.refresh(),
        ]);
        expect(res[0]).toBe(1);
        expect(res[0]).toBe(res[1]);
      });
    });
  });
});
