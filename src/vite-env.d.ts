/**
 * =====================================================
 * Vite 环境类型声明 —— 相当于后端的类型适配器
 * =====================================================
 *
 * 【这个文件是做什么的？】
 *   TypeScript 默认不认识 .vue 文件，需要手动声明模块类型
 *   这个文件告诉 TypeScript："当你遇到 import xxx from 'xxx.vue' 时，
 *   把它当作一个 Vue 组件类型来处理"
 *
 * 【后端类比】
 *   相当于后端的 TypeAdapter / 类型转换器
 *   就像后端需要告诉 Jackson 如何序列化/反序列化某个自定义类型
 *
 * 【declare module 是什么？】
 *   declare module —— 声明模块类型（TypeScript 的类型扩展机制）
 *   【后端类比】相当于后端的 @JsonDeserialize / 自定义类型转换器
 *   当 TypeScript 遇到 import xxx from '*.vue' 时，使用这里定义的类型
 *
 * 【为什么需要这个？】
 *   .vue 文件不是标准的 TypeScript/JavaScript 文件
 *   TypeScript 编译器不知道 .vue 文件导出的是什么
 *   通过 declare module 告诉编译器：所有 .vue 文件都导出一个 Vue 组件
 *   这样 import App from './App.vue' 就不会报类型错误
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  /**
   * DefineComponent<{}, {}, any> —— Vue 组件的类型
   *   第一个 {} —— props 类型（空对象表示没有外部传入的属性）
   *   第二个 {} —— emits 类型（空对象表示没有触发的事件）
   *   any —— 组件内部数据类型（any 表示不限制）
   * 【后端类比】相当于后端的泛型类 Component<Props, Emits, Data>
   */
  const component: DefineComponent<{}, {}, any>
  export default component
}
