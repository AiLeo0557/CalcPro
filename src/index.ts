// 运算符枚举
export enum Operator {
  ADD = "+",
  SUB = "-",
  MUL = "*",
  DIV = "/",
}

// 四则运算接口
export interface MathOperation {
  (a: number, b: number): number;
}

// 将数字分割成小数部分和整数部分
export const splitNumber = (num: number): [number, number] => {
  return num.toString().match(/(\d+)\.?(\d*)/)!.slice(1).map(Number) as [number, number];
}
// 获取整数部分的位数
export const getIntegerDigits = (num: number): number => {
  return num.toString().split('.')[0].length;
}
// 获取小数部分的位数
export const getDecimalDigits = (num: number): number => {
  return num.toString().split('.')[1]?.length || 0;
}

// 运算函数生成器, 用于生成一个接收两个数字参数进行四则运算函数的高级函数
export const createOperation = (operator: Operator): MathOperation => {
  return (a: number, b: number): number => {
    // 如果是除法, 则检查除数是否为0
    if (operator === Operator.DIV && b === 0) {
      throw new Error("Division by zero is not allowed.");
    }
    // 分别获取两个数字的小数部分的位数
    const aDecimalDigits = getDecimalDigits(a);
    const bDecimalDigits = getDecimalDigits(b);

    // 推算出结果的小数部分的位数 
    let resultDecimalDigits = 0;
    switch (operator) {
      case Operator.ADD:
      case Operator.SUB:
      case Operator.DIV:
        resultDecimalDigits = Math.max(aDecimalDigits, bDecimalDigits);
        break;
      case Operator.MUL:
        resultDecimalDigits = aDecimalDigits + bDecimalDigits;
        break;
    }

    // 根据结果的小数部分的位数, 将两个数字的小数部分补齐到相同长度并转换为整数
    const pow = Math.pow(10, resultDecimalDigits);
    const aScaled = a * pow;
    const bScaled = b * pow;
    // 将两个参与运算的数字转换为整数, 以避免浮点数计算的精度问题
    // 例如: 0.1 + 0.2 = 0.30000000000000004
    // 0.1 * 0.2 = 0.020000000000000004
    // 0.1 / 0.2 = 0.49999999999999994
    const aInt = a * 10 ** aDecimalDigits;
    const bInt = b * 10 ** bDecimalDigits;

    // 计算结果
    switch (operator) {
      case Operator.ADD:
        return (aScaled + bScaled) / pow; // 返回结果并除以pow, 将结果转换回原来的小数位数
      case Operator.SUB:
        return (aScaled - bScaled) / pow; // 返回结果并除以pow, 将结果转换回原来的小数位数
      case Operator.MUL:
        return Number(aInt * bInt) / pow; // 返回结果并除以pow的平方, 将结果转换回原来的小数位数
      case Operator.DIV:
        const Base = BigInt(pow);
        const BA = BigInt(a * Number(Base));
        const BB = BigInt(b * Number(Base));
        return Number(BA) / Number(BB); // 直接返回结果, 结果的小数位数已经在上面的计算中处理好了bInt; // 直接返回结果, 结果的小数位数已经在上面的计算中处理好了
      default:
        throw new Error("Invalid operator");
    }
  }
}

// 生成加法
export const add = createOperation(Operator.ADD);
// 生成减法
export const sub = createOperation(Operator.SUB);
// 生成乘法
export const mul = createOperation(Operator.MUL);
// 生成除法
export const div = createOperation(Operator.DIV);

// 累计计算函数生成器, 用于生成一个接收一个数字参数并返回一个接收一个数字参数进行累计计算的函数
export const createAccumulateOperation = (operation: MathOperation): (args: number[]) => number => (args: number[]) => args.reduce(operation);
// 生成累计加函数
export const accumulateAdd = createAccumulateOperation(add);
// 生成累计减函数
export const accumulateSub = createAccumulateOperation(sub);
// 生成累计乘函数
export const accumulateMul = createAccumulateOperation(mul);
// 生成累计除函数
export const accumulateDiv = createAccumulateOperation(div);
class HiCalcPro {
  // 四则运算开始标识
  private start: boolean = true;
  // 计算结果保留小数位数
  private decimalPlaces?: number;
  // 计算结果
  private _value: number = 0;
  // 获取计算结果,如果设置了保留小数位数,则返回保留小数位数的结果
  public get value(): number {
    return this.decimalPlaces ? Number(this._value.toFixed(this.decimalPlaces)) : this._value;
  }
  // 构造器接收一个数字初始化计算结果小数保留位数
  private constructor(decimalPlaces?: number) {
    this.decimalPlaces = decimalPlaces;
  }
  // 生成一个计算器实例
  public static create(decimalPlaces?: number): HiCalcPro {
    return new HiCalcPro(decimalPlaces);
  }
  // 计算方法生成器
  private operationGenerator = (type: Operator, args: number[]): HiCalcPro => {
    switch (type) {
      case Operator.ADD:
        this._value = accumulateAdd.call(this, [this._value, ...args]); // 累加
        break;
      case Operator.SUB:
        this._value = accumulateSub.call(this, this.start ? args : [this._value, ...args]); // 累减
        break;
      case Operator.MUL:
        this._value = accumulateMul.call(this, this.start ? args : [this._value, ...args]); // 累乘
        break;
      case Operator.DIV:
        this._value = accumulateDiv.call(this, this.start ? args : [this._value, ...args]); // 累除
      default:
        break;
    }
    this.start = false;
    return this;
  }
  // 加法
  public add(...args: number[]): HiCalcPro {
    return this.operationGenerator(Operator.ADD, args);
  }
  // 减法
  public sub(...args: number[]): HiCalcPro {
    return this.operationGenerator(Operator.SUB, args);
  }
  // 乘法
  public mul(...args: number[]): HiCalcPro {
    return this.operationGenerator(Operator.MUL, args);
  }
  // 除法
  // 定义一个div方法，接收一个或多个number类型的参数，返回一个HiCalcPro类型的对象
  public div(...args: number[]): HiCalcPro {
    // 调用operationGenerator方法，传入Operator.DIV和args参数，返回一个HiCalcPro类型的对象
    return this.operationGenerator(Operator.DIV, args);
  }
}
const calc = HiCalcPro.create;
// 导出类
export { HiCalcPro, calc };
// 默认导出
export default HiCalcPro;