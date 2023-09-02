import oi, { OnceInit } from "../src/index";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

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
  it("defined", () => {
    expect(oi).toBeDefined();
    expect(OnceInit).toBeDefined();
  });
  it("测试Promise", async () => {
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
  afterEach(async () => {
    await oiPromise.wait();
  });

  describe("单独测试", () => {
    it("normal", async () => {
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

    it("init", async () => {
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
      const res1 = await Promise.all([
        oiPromise.init(),
        oiPromise.init(),
        oiPromise.init(),
        oiPromise.init(),
      ]);
      expect(res1[0]).toBe(1);
      expect(res1[0]).toBe(res1[1]);
      expect(res1[1]).toBe(res1[2]);
      expect(res1[2]).toBe(res1[3]);
    });

    it("const init = oiPromise.init", async () => {
      const init = oiPromise.init;
      const res = await Promise.all([init(), init(), init(), init()]);
      expect(res[0]).toBe(1);
      expect(res[0]).toBe(res[1]);
      expect(res[1]).toBe(res[2]);
      expect(res[2]).toBe(res[3]);
      const res1 = await Promise.all([init(), init(), init(), init()]);
      expect(res1[0]).toBe(1);
      expect(res1[0]).toBe(res1[1]);
      expect(res1[1]).toBe(res1[2]);
      expect(res1[2]).toBe(res1[3]);
    });

    it("refresh", async () => {
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
      const res1 = await Promise.all([
        oiPromise.refresh(),
        oiPromise.refresh(),
        oiPromise.refresh(),
        oiPromise.refresh(),
      ]);
      expect(res1[0]).toBe(2);
      expect(res1[0]).toBe(res1[1]);
      expect(res1[1]).toBe(res1[2]);
      expect(res1[2]).toBe(res1[3]);
    });

    it("const refresh = oiPromise.refresh", async () => {
      const refresh = oiPromise.refresh;
      const res = await Promise.all([
        refresh(),
        refresh(),
        refresh(),
        refresh(),
      ]);
      expect(res[0]).toBe(1);
      expect(res[0]).toBe(res[1]);
      expect(res[1]).toBe(res[2]);
      expect(res[2]).toBe(res[3]);
      const res1 = await Promise.all([
        refresh(),
        refresh(),
        refresh(),
        refresh(),
      ]);
      expect(res1[0]).toBe(2);
      expect(res1[0]).toBe(res1[1]);
      expect(res1[1]).toBe(res1[2]);
      expect(res1[2]).toBe(res1[3]);
    });

    it("get", async () => {
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

    it("exceed", async () => {
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

      const res1 = await Promise.all([
        oiPromise.exceed(),
        oiPromise.exceed(),
        oiPromise.exceed(),
        oiPromise.exceed(),
      ]);
      expect(res1[0]).toBe(5);
      expect(res1[1]).toBe(6);
      expect(res1[2]).toBe(7);
      expect(res1[3]).toBe(8);
    });

    it("execute", async () => {
      const initPromiseRes = await oiPromise.init();
      const res = await Promise.all([
        oiPromise.execute(),
        oiPromise.execute(),
        oiPromise.execute(),
        oiPromise.execute(),
      ]);
      expect(res[0]).toBe(initPromiseRes + 1);
      expect(res[1]).toBe(initPromiseRes + 2);
      expect(res[2]).toBe(initPromiseRes + 3);
      expect(res[3]).toBe(initPromiseRes + 4);

      const res1 = await Promise.all([
        oiPromise.init(),
        oiPromise.init(),
        oiPromise.init(),
        oiPromise.init(),
      ]);

      expect(res1[0]).toBe(initPromiseRes);
      expect(res1[1]).toBe(initPromiseRes);
      expect(res1[2]).toBe(initPromiseRes);
      expect(res1[3]).toBe(initPromiseRes);
    });

    describe("wait", () => {
      it("wait", async () => {
        expect(await oiPromise.wait()).toBeUndefined();
        oiPromise.init();
        expect(val).toBe(0);
        await oiPromise.wait();
        expect(val).toBe(1);
      });
    });
  });

  describe("复合测试", () => {
    describe("init + refresh", () => {
      it("init => refresh", async () => {
        const res = await Promise.all([
          oiPromise.init(),
          oiPromise.refresh(),
          oiPromise.refresh(),
          oiPromise.refresh(),
        ]);
        expect(res[0]).toBe(1);
        expect(res[0]).toBe(res[1]);
      });

      it("refresh => init", async () => {
        const res = await Promise.all([
          oiPromise.refresh(),
          oiPromise.init(),
          oiPromise.refresh(),
          oiPromise.refresh(),
        ]);
        expect(res[0]).toBe(1);
        expect(res[0]).toBe(res[1]);
      });

      it("setTimeout-refresh => init", async () => {
        setTimeout(async () => {
          const res = await oiPromise.refresh();
          expect(res).toBe(1);
        }, 4);
        const res = await oiPromise.init();
        expect(res).toBe(1);
      });

      it("setTimeout-init => refresh", async () => {
        setTimeout(async () => {
          const res = await oiPromise.init();
          expect(res).toBe(1);
        }, 4);
        const res = await oiPromise.refresh();
        expect(res).toBe(1);
      });
    });

    describe("init + get", () => {
      it("init => get", async () => {
        const res1 = oiPromise.get();
        expect(res1).toBeUndefined();
        const res2 = await oiPromise.init();
        expect(res2).toBe(1);
        const res3 = oiPromise.get();
        expect(res3).toBe(res2);
      });
    });

    describe("init + refresh + exceed", () => {
      it("refresh => exceed | exceed => refresh + init", async () => {
        const res1 = await Promise.all([
          oiPromise.refresh(),
          oiPromise.exceed(),
        ]); // 50秒后，返回 [1, 2];

        expect(res1).toEqual([1, 2]);

        const res2 = await Promise.all([
          oiPromise.exceed(),
          oiPromise.refresh(),
        ]); // 50秒后，返回 [3, 3];

        expect(res2).toEqual([3, 3]);

        const res3 = await Promise.all([
          oiPromise.exceed(),
          oiPromise.refresh(),
          oiPromise.init(),
        ]); // 50秒后，返回 [4, 4, 4];

        expect(res3).toEqual([4, 4, 3]);

        const res4 = await oiPromise.init();
        expect(res4).toBe(4);

        const res5 = await Promise.all([
          oiPromise.init(),
          oiPromise.exceed(),
          oiPromise.refresh(),
          oiPromise.exceed(),
          oiPromise.refresh(),
          oiPromise.init(),
        ]); // 50秒后，返回 [5, 5, 6, 5, 4];

        expect(res5).toEqual([4, 5, 5, 6, 6, 4]);
      });
    });

    describe("init + execute + refresh", () => {
      it("init => execute => init => refresh", async () => {
        const res1 = await oiPromise.init(); // 50秒后，返回 1
        expect(res1).toBe(1);
        const res2 = await oiPromise.execute(); // 50秒后，返回 2
        expect(res2).toBe(2);
        const res3 = await oiPromise.init(); // 0秒后，返回 1 （缓存未更新）
        expect(res3).toBe(1);
        const res4 = await oiPromise.refresh(); // 50秒后，返回 3 （缓存更新，重新获取后端值，由于后端在上次execute请求中虽未更新缓存，但更新了后端，所以返回值为3）
        expect(res4).toBe(3);
      });
    });
  });
});

describe("带参测试", () => {
  let res1 = 0;
  let res2 = 0;
  const paramsRunPromise = (op: "+" | "-") => {
    return new Promise<number>((res) => {
      setTimeout(() => {
        if (op === "+") {
          res(++res1);
        } else {
          res(--res2);
        }
      });
    });
  };
  let oiPromise: OnceInit<number, [op: "+" | "-"]>;
  /** 重置val和oiPromise */
  beforeEach(() => {
    oiPromise = oi(paramsRunPromise);
    res1 = 0;
    res2 = 0;
  });
  describe("init + refresh", () => {
    it("init => refresh", async () => {
      expect(await oiPromise.init("-")).toBe(-1);
      expect(await oiPromise.refresh("-")).toBe(-2);
      expect(await oiPromise.refresh("-")).toBe(-3);
      expect(await oiPromise.refresh("+")).toBe(1);
      expect(await oiPromise.init("-")).toBe(-3);
    });
  });
});

/** 由github用户 Banlangenn 提出的问题 */
describe("测试执行顺序", () => {
  describe("init", () => {
    /** 新建一个单独的promise函数用于测试 */
    let val = 0;
    const runPromise = () => {
      return new Promise<number>((res) => {
        setTimeout(() => {
          res(++val);
        }, 10);
      });
    };
    /** 包装promise */
    const fn = oi(runPromise);
    const fnInit = fn.init;
    const invokedFn = vi.fn();
    it("invoke function", async () => {
      let inc = 0;
      fnInit().then(() => {
        expect(invokedFn).toBeCalledTimes(0);
        invokedFn();
        inc++;
        expect(inc).toBe(1);
        expect(invokedFn).toBeCalledTimes(1);
      });
      fnInit().then(() => {
        expect(invokedFn).toBeCalledTimes(1);
        invokedFn();
        inc++;
        expect(inc).toBe(2);
        expect(invokedFn).toBeCalledTimes(2);
      });
      fnInit().then(() => {
        expect(invokedFn).toBeCalledTimes(2);
        invokedFn();
        inc++;
        expect(inc).toBe(3);
        expect(invokedFn).toBeCalledTimes(3);
      });
      fnInit().then(() => {
        expect(invokedFn).toBeCalledTimes(3);
        invokedFn();
        inc++;
        expect(inc).toBe(4);
        expect(invokedFn).toBeCalledTimes(4);
      });
      await fn.wait();
    });
  });

  describe("refresh", () => {
    /** 新建一个单独的promise函数用于测试 */
    let val = 0;
    const runPromise = () => {
      return new Promise<number>((res) => {
        setTimeout(() => {
          res(++val);
        }, 10);
      });
    };
    /** 包装promise */
    const fn = oi(runPromise);
    const fnRefresh = fn.refresh;
    const invokedFn = vi.fn();
    it("invoke function", async () => {
      let inc = 0;
      fnRefresh().then(() => {
        expect(invokedFn).toBeCalledTimes(0);
        invokedFn();
        inc++;
        expect(inc).toBe(1);
        expect(invokedFn).toBeCalledTimes(1);
      });
      fnRefresh().then(() => {
        expect(invokedFn).toBeCalledTimes(1);
        invokedFn();
        inc++;
        expect(inc).toBe(2);
        expect(invokedFn).toBeCalledTimes(2);
      });
      fnRefresh().then(() => {
        expect(invokedFn).toBeCalledTimes(2);
        invokedFn();
        inc++;
        expect(inc).toBe(3);
        expect(invokedFn).toBeCalledTimes(3);
      });
      fnRefresh().then(() => {
        expect(invokedFn).toBeCalledTimes(3);
        invokedFn();
        inc++;
        expect(inc).toBe(4);
        expect(invokedFn).toBeCalledTimes(4);
      });
      await fn.wait();
    });
  });

  describe("exceed", () => {
    /** 新建一个单独的promise函数用于测试 */
    let val = 0;
    const runPromise = () => {
      return new Promise<number>((res) => {
        setTimeout(() => {
          res(++val);
        }, 10);
      });
    };
    /** 包装promise */
    const fn = oi(runPromise);
    const fnExceed = fn.exceed;
    const invokedFn = vi.fn();
    it("invoke function", async () => {
      let inc = 0;
      fnExceed().then(() => {
        expect(invokedFn).toBeCalledTimes(0);
        invokedFn();
        inc++;
        expect(inc).toBe(1);
        expect(invokedFn).toBeCalledTimes(1);
      });
      fnExceed().then(() => {
        expect(invokedFn).toBeCalledTimes(1);
        invokedFn();
        inc++;
        expect(inc).toBe(2);
        expect(invokedFn).toBeCalledTimes(2);
      });
      fnExceed().then(() => {
        expect(invokedFn).toBeCalledTimes(2);
        invokedFn();
        inc++;
        expect(inc).toBe(3);
        expect(invokedFn).toBeCalledTimes(3);
      });
      fnExceed().then(() => {
        expect(invokedFn).toBeCalledTimes(3);
        invokedFn();
        inc++;
        expect(inc).toBe(4);
        expect(invokedFn).toBeCalledTimes(4);
      });
      await fn.wait();
    });
  });
});

describe("Promise", () => {
  /** 新建一个单独的promise函数用于测试 */
  let val = 0;
  const runPromise = () => {
    return new Promise<number>((res) => {
      setTimeout(() => {
        res(++val);
      }, 10);
    });
  };
  /** 包装promise */
  it("init", async () => {
    const fn = oi(runPromise);
    const firstCall = fn.init();
    expect(firstCall.then).toBeDefined();
    expect(firstCall.finally).toBeDefined();
    await firstCall;
    const secondCall = fn.init();
    expect(secondCall.then).toBeDefined();
    expect(secondCall.finally).toBeDefined();
  });

  it("refersh", async () => {
    const fn = oi(runPromise);
    const firstCall = fn.refresh();
    expect(firstCall.then).toBeDefined();
    expect(firstCall.finally).toBeDefined();
    await firstCall;
    const secondCall = fn.refresh();
    expect(secondCall.then).toBeDefined();
    expect(secondCall.finally).toBeDefined();
  });

  it("exceed", async () => {
    const fn = oi(runPromise);
    const firstCall = fn.exceed();
    expect(firstCall.then).toBeDefined();
    expect(firstCall.finally).toBeDefined();
    await firstCall;
    const secondCall = fn.exceed();
    expect(secondCall.then).toBeDefined();
    expect(secondCall.finally).toBeDefined();
  });
});

describe("测试错误处理", () => {
  let cnt = 0;
  beforeEach(() => {
    cnt = 0;
  });
  /** Thanks to @richex-cn(https://github.com/richex-cn) */
  async function incrementPromise() {
    cnt++;
    if (cnt < 3) throw new Error("cnt " + cnt.toString());
    return cnt;
  }

  it("should throw error", async () => {
    const fn = oi(incrementPromise);
    await expect(fn.init()).rejects.toThrow("cnt " + cnt.toString());
  });

  it("should refresh without error", async () => {
    const fn = oi(incrementPromise);
    await expect(fn.init()).rejects.toThrow("cnt " + cnt.toString());
    await expect(fn.refresh()).rejects.toThrow("cnt " + cnt.toString());
    const refreshAns = await fn.refresh();
    expect(refreshAns).toBe(cnt);
  });

  it("should exceed without error", async () => {
    const fn = oi(incrementPromise);
    await expect(fn.exceed()).rejects.toThrow("cnt " + cnt.toString());
    await expect(fn.exceed()).rejects.toThrow("cnt " + cnt.toString());
    const refreshAns = await fn.exceed();
    expect(refreshAns).toBe(cnt);
  });
});

describe("clear", async () => {});
