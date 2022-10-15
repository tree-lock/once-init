import { packagedByRefresh } from "../src";

describe(packagedByRefresh.name, () => {
  const obj = {
    val: 0,
    a() {
      return new Promise<typeof obj.val>((res) => {
        setTimeout(() => {
          res(++obj.val);
        }, 10);
      });
    },
  };
  beforeEach(() => {
    obj.val = 0;
  });
  const packagedObj = packagedByRefresh(obj);
  it("obj", async () => {
    const res = await Promise.all([obj.a(), obj.a(), obj.a(), obj.a()]);
    expect(res[0]).toBe(1);
    expect(res[1]).toBe(2);
    expect(res[2]).toBe(3);
    expect(res[3]).toBe(4);
  });

  it("packagedObj", async () => {
    const res = await Promise.all([
      packagedObj.a(),
      packagedObj.a(),
      packagedObj.a(),
      packagedObj.a(),
    ]);
    expect(res[0]).toBe(1);
    expect(res[1]).toBe(res[0]);
    expect(res[2]).toBe(res[0]);
    expect(res[3]).toBe(res[0]);

    const res1 = await Promise.all([
      packagedObj.a(),
      packagedObj.a(),
      packagedObj.a(),
      packagedObj.a(),
    ]);
    expect(res1[0]).toBe(2);
    expect(res1[1]).toBe(res1[0]);
    expect(res1[2]).toBe(res1[0]);
    expect(res1[3]).toBe(res1[0]);
  });
});
