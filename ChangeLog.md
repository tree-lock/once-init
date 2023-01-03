# 1.0.0

1. 由于用户可以在 Promise Function 里自定义相关的状态，`once-init`没有必要画蛇添足，因此取消了 target 和 factory 方法，取消了 loading 加载状态。
2. 添加了参数区分，现在，允许通过参数来划分不同的 Promise Function，参数通过`lodash.isEqual`来进行区分。
3. 添加了 强制执行方法 exceed() 和 等待执行方法 wait()
4. 同步方法为 get()，如果值在之前初始化过，则返回对应的值，否则返回 undefined，同步执行不再主动触发 promise。
5. send、request 和 refresh 是同一个方法，定义它们是为了方便更好的语义化。

## 1.2.0

1. 解决了`refresh`执行顺序混乱的 bug；([#4](https://github.com/darkXmo/once-init/issues/4))
2. 疑似解决了部分相同类型的赋值会报 TS 错误的 bug；([#2](https://github.com/darkXmo/once-init/issues/2))

## 1.1.0

1. 易读性更强的文档；
2. 减少了`lodash`的打包大小；([#1](https://github.com/darkXmo/once-init/pull/1))

# TODO

1. 提供更小版本的自定义式判断参数的方案（即不需要 lodash 那么复杂的方案以减少打包大小）作为选择；
2. 加强类型，现在的 TS 类型无法满足 `axios.get = oi(axios.get).refresh` ;

# History

## 0.8.0

1. If once-init initialized with a default value, the return type of `target`, `init`, `refresh` will not include `undefined`;
2. Better Type support.
