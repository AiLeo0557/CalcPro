// 引入插件
import CalcPro from "../dist";

// 0.1 + 0.2 = 0.30000000000000004
// 0.1 * 0.2 = 0.020000000000000004
// 0.1 / 0.2 = 0.49999999999999994
describe("CalcPro", () => {
  // 测试加法
  test("add should return the sum of two numbers", () => {
    expect(CalcPro.create().add(0.1, 0.2).value).toBe(0.3);
  });

  // 测试减法
  test("subtract should return the difference of two numbers", () => {
    expect(CalcPro.create().sub(1.00011, 0.1).value).toBe(0.90011);
  });

  // 测试乘法
  test("multiply should return the product of two numbers", () => {
    expect(CalcPro.create().mul(0.00011, 0.1).value).toBe(0.000011);
  });

  // 测试除法
  test("divide should return the quotient of two numbers", () => {
    expect(CalcPro.create(6).div(10000, 0.00011).value).toBe(90909090.909091);

    // 测试除以零的情况
    expect(() => CalcPro.create().div(5, 0).value).toThrow("Division by zero is not allowed.");
  });
});
