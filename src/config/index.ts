/**
 * =====================================================
 * 全局配置文件 —— 相当于后端的 application.yml
 * =====================================================
 *
 * 【后端类比】
 *   - config 对象相当于后端的 application.yml 配置
 *   - apiEndpoints 对象相当于后端 Controller 的路由前缀常量
 *     就像你后端用 @RequestMapping("/auth") 定义路由，前端用 apiEndpoints.auth 定义请求路径
 *
 * 【为什么要集中管理 API 路径？】
 *   - 如果每个页面组件都硬编码 '/auth/login'，后端改了路径就要改 N 个地方
 *   - 集中管理后，后端改路径只需要改这一个文件
 *   - 【后端类比】就像后端把数据库表名、字段名定义为常量，避免硬编码
 */

/**
 * config —— HTTP 请求的基础配置
 * 【后端类比】相当于后端 application.yml 中的以下配置：
 *   server:
 *     port: 8080
 *     servlet:
 *       context-path: /api
 */
const config = {
  /**
   * baseURL —— API 基础地址
   * 所有 HTTP 请求都会自动加上这个前缀
   * 例如：request.get('/auth/login') 实际请求的是 http://localhost:8080/api/auth/login
   * 【后端类比】相当于后端的 server.servlet.context-path=/api
   *   - 后端：所有 Controller 的路径都加上 /api 前缀
   *   - 前端：所有 Axios 请求都加上 http://localhost:8080/api 前缀
   */
  baseURL: 'http://localhost:8080/api',

  /**
   * timeout —— 请求超时时间（毫秒）
   * 超过 30 秒没有响应，请求自动取消
   * 【后端类比】相当于后端的 spring.mvc.async.request-timeout=30000
   */
  timeout: 30000,

  /**
   * headers —— 默认请求头
   * Content-Type: application/json 表示请求体是 JSON 格式
   * 【后端类比】相当于后端的 @RequestBody 注解，告诉服务器请求体是 JSON
   */
  headers: {
    'Content-Type': 'application/json'
  }
}

/**
 * apiEndpoints —— 所有后端 API 端点路径的集中管理
 * 【后端类比】相当于把所有 @RequestMapping 的路径值提取为常量
 *   - 后端：@PostMapping("/auth/login") → 前端：apiEndpoints.auth.login = '/auth/login'
 *   - 这样前后端的路径对应关系一目了然
 *
 * 【结构说明】
 *   按业务模块分组，每个模块对应后端的一个 Controller：
 *   - auth → AuthController（/auth）
 *   - accessKey → AccessKeyController（/user/accessKey）
 *   - api → ApiController（/api）
 *   - favorite → ApiFavoriteController（/favorite）
 *   - trade → OrderController（/order）
 *   - test → TestController（/test）
 *   - requirement → RequirementController（/requirement）
 *   - whitelist → ApiWhitelistController（/whitelist）
 *   - review → ApiReviewController（/review）
 *   - afterSale → RequirementAfterSaleController（/requirement/after-sale）
 *   - admin → ManagerController（/admin）
 *   - userTag → UserTagController（/user-tag）
 *   - matching → MatchingController（/matching）
 */
export const apiEndpoints = {
  /**
   * 认证模块 —— 对应后端 AuthController
   * 路由前缀：/auth
   */
  auth: {
    register: '/auth/register',           // 用户注册 → 后端 @PostMapping("/register")
    login: '/auth/login',                 // 用户登录 → 后端 @PostMapping("/login")
    logout: '/auth/logout',               // 用户登出 → 后端 @PostMapping("/logout")
    userInfo: '/auth/user-info',          // 获取用户信息 → 后端 @GetMapping("/user-info")
    updateUserInfo: '/auth/user-info',    // 更新用户信息 → 后端 @PutMapping("/user-info")
    updatePassword: '/auth/password'      // 修改密码 → 后端 @PutMapping("/password")
  },

  /**
   * 密钥模块 —— 对应后端 AccessKeyController
   * 路由前缀：/user/accessKey
   * AK/SK 用于 API 调用时的身份鉴权
   */
  accessKey: {
    info: '/user/accessKey/info',         // 获取当前用户的 AK/SK → 后端 @GetMapping("/info")
    regenerate: '/user/accessKey/regenerate' // 重新生成 AK/SK → 后端 @PostMapping("/regenerate")
  },

  /**
   * 配额模块 —— 对应后端 QuotaController
   * 路由前缀：/quota
   */
  quota: {
    list: '/quota/list'                   // 查询配额列表 → 后端 @GetMapping("/list")
  },

  /**
   * API 管理模块 —— 对应后端 ApiController
   * 路由前缀：/api
   */
  api: {
    list: '/api/list',                    // API 列表（分页） → 后端 @GetMapping("/list")
    detail: '/api/detail',                // API 详情 → 后端 @GetMapping("/detail/{id}")
    create: '/api/create',                // 创建 API → 后端 @PostMapping("/create")
    update: '/api/update',                // 更新 API → 后端 @PutMapping("/update/{id}")
    updateStatus: '/api/updateStatus',    // 更新 API 状态（审核/上下架） → 后端 @PutMapping("/updateStatus/{id}")
    myApis: '/api/getApis',               // 我创建的 API 列表 → 后端 @GetMapping("/getApis")
    statistics: '/api/statistics',        // API 调用统计 → 后端 @GetMapping("/statistics/{id}")
    myInvokeStatistics: '/api/statistics/my-invoke',      // 我调用的 API 统计（作为调用方）
    myApiInvokeStatistics: '/api/statistics/my-api-invoke', // 我的 API 被调用统计（作为提供方）
    apiTypes: '/api/api-types'            // API 分类列表 → 后端 @GetMapping("/api-types")
  },

  /**
   * 收藏模块 —— 对应后端 ApiFavoriteController
   * 路由前缀：/favorite
   */
  favorite: {
    add: '/favorite/add',                 // 收藏 API → 后端 @PostMapping("/add/{apiId}")
    remove: '/favorite/remove',           // 取消收藏 → 后端 @DeleteMapping("/remove/{apiId}")
    check: '/favorite/check',             // 检查是否已收藏 → 后端 @GetMapping("/check/{apiId}")
    list: '/favorite/list'                // 收藏列表 → 后端 @GetMapping("/list")
  },

  /**
   * 订单/交易模块 —— 对应后端 OrderController
   * 路由前缀：/order
   */
  trade: {
    purchase: '/order/create',            // 创建订单（购买 API） → 后端 @PostMapping("/create")
    orders: '/order/list',                // 我的订单列表 → 后端 @GetMapping("/list")
    orderDetail: '/order/detail',         // 订单详情 → 后端 @GetMapping("/detail/{id}")
    updateStatus: '/order/update-status', // 更新订单状态 → 后端 @PutMapping("/update-status/{id}")
    delete: '/order/delete',              // 删除订单 → 后端 @DeleteMapping("/delete/{id}")
    evaluate: '/order/rate',              // 评价订单 → 后端 @PostMapping("/rate/{id}")
    pay: '/order/pay',                    // 发起支付宝支付 → 后端 @PostMapping("/pay/{id}")
    queryPayStatus: '/order/pay/query'    // 查询支付状态 → 后端 @GetMapping("/pay/query/{id}")
  },

  /**
   * API 测试模块 —— 对应后端 TestController
   * 路由前缀：/test
   */
  test: {
    testCall: '/test/call',               // 在线调用测试 → 后端 @PostMapping("/call")
    recordCount: '/test/records/count',   // 今日测试次数 → 后端 @GetMapping("/records/count")
    saveRecord: '/test/save-record',      // 保存测试记录 → 后端 @PostMapping("/save-record")
    records: '/test/records',             // 测试记录列表 → 后端 @GetMapping("/records")
    deleteRecord: '/test/records'         // 删除测试记录 → 后端 @DeleteMapping("/records/{id}")
  },

  /**
   * 需求模块 —— 对应后端 RequirementController
   * 路由前缀：/requirement
   * 需求状态流转：open → in_progress → delivered → completed / cancelled
   */
  requirement: {
    list: '/requirement/list',            // 需求列表 → 后端 @GetMapping("/list")
    detail: '/requirement/detail',        // 需求详情 → 后端 @GetMapping("/detail/{id}")
    create: '/requirement/create',        // 发布需求 → 后端 @PostMapping("/create")
    update: '/requirement/update',        // 更新需求 → 后端 @PutMapping("/update/{id}")
    delete: '/requirement/delete',        // 删除需求 → 后端 @DeleteMapping("/delete/{id}")
    apply: '/requirement/apply',          // 申请接单 → 后端 @PostMapping("/apply/{id}")
    withdrawApply: '/requirement/withdraw-apply', // 撤回申请 → 后端 @PostMapping("/withdraw-apply/{id}")
    selectApplicant: '/requirement/select-applicant', // 选择开发者 → 后端 @PostMapping("/select-applicant/{id}")
    complete: '/requirement/complete',    // 完成需求 → 后端 @PostMapping("/complete/{id}")
    cancel: '/requirement/cancel',        // 取消需求 → 后端 @PostMapping("/cancel/{id}")
    deliver: '/requirement/deliver',      // 开发者交付 → 后端 @PostMapping("/deliver/{id}")
    confirmDelivery: '/requirement/confirm-delivery', // 确认交付 → 后端 @PostMapping("/confirm-delivery/{id}")
    myRequirements: '/requirement/my-requirements' // 我的需求 → 后端 @GetMapping("/my-requirements")
  },

  /**
   * 白名单模块 —— 对应后端 ApiWhitelistController
   * 路由前缀：/whitelist
   * 白名单模式：API 启用后，只有白名单中的用户才能调用
   */
  whitelist: {
    add: '/whitelist/add',               // 添加白名单用户 → 后端 @PostMapping("/add/{apiId}")
    remove: '/whitelist/remove',          // 移除白名单用户 → 后端 @DeleteMapping("/remove/{apiId}/{userId}")
    list: '/whitelist/list',              // 白名单列表 → 后端 @GetMapping("/list/{apiId}")
    enable: '/whitelist/enable',          // 启用白名单 → 后端 @PostMapping("/enable/{apiId}")
    disable: '/whitelist/disable'         // 停用白名单 → 后端 @PostMapping("/disable/{apiId}")
  },

  /**
   * 评价模块 —— 对应后端 ApiReviewController
   * 路由前缀：/review
   * 评价支持嵌套回复：replyType 0=主评价, 1=发布者回复, 2=用户回复
   */
  review: {
    create: '/review/create',             // 创建评价 → 后端 @PostMapping("/create")
    publisherReply: '/review/publisher/reply', // 发布者回复 → 后端 @PostMapping("/publisher/reply")
    update: '/review/update',             // 更新评价 → 后端 @PostMapping("/update")
    delete: '/review/delete',             // 删除评价 → 后端 @PostMapping("/delete/{id}")
    userReply: '/review/user/reply',      // 用户回复 → 后端 @PostMapping("/user/reply")
    list: '/review/list',                 // 评价列表 → 后端 @GetMapping("/list/{apiId}")
    myReviews: '/review/my-reviews',      // 我的评价 → 后端 @GetMapping("/my-reviews")
    detail: '/review/detail'              // 评价详情 → 后端 @GetMapping("/detail/{id}")
  },

  /**
   * 售后模块 —— 对应后端 RequirementAfterSaleController
   * 路由前缀：/requirement/after-sale
   * 售后状态流转：pending → resolved / rejected
   */
  afterSale: {
    create: '/requirement/after-sale/create',           // 创建售后 → 后端 @PostMapping("/create")
    respond: '/requirement/after-sale/respond',         // 开发者响应 → 后端 @PostMapping("/respond/{id}")
    decide: '/requirement/after-sale/decide',           // 管理员裁定 → 后端 @PostMapping("/decide/{id}")
    detail: '/requirement/after-sale/detail',           // 售后详情 → 后端 @GetMapping("/detail/{id}")
    list: '/requirement/after-sale/list',               // 售后列表（管理员） → 后端 @GetMapping("/list")
    myAfterSales: '/requirement/after-sale/my-after-sales', // 我申请的售后 → 后端 @GetMapping("/my-after-sales")
    developerAfterSales: '/requirement/after-sale/developer-after-sales', // 我接单的售后 → 后端 @GetMapping("/developer-after-sales")
    messages: '/requirement/after-sale/messages',       // 售后对话记录 → 后端 @GetMapping("/messages/{id}")
    sendMessage: '/requirement/after-sale/message/send' // 发送售后消息 → 后端 @PostMapping("/message/send/{id}")
  },

  /**
   * 管理后台模块 —— 对应后端 ManagerController
   * 路由前缀：/admin
   * 所有接口需要管理员权限（isAdmin=1）
   */
  admin: {
    users: '/admin/users',                // 用户列表 → 后端 @GetMapping("/users")
    freezeUser: '/admin/users',           // 冻结用户 → 后端 @PutMapping("/users/{id}/freeze")
    unfreezeUser: '/admin/users',         // 解冻用户 → 后端 @PutMapping("/users/{id}/unfreeze")
    exportUsers: '/admin/users/export',   // 导出用户 Excel → 后端 @GetMapping("/users/export")
    apis: '/admin/apis',                  // API 列表（管理） → 后端 @GetMapping("/apis")
    apiTypes: '/admin/api-types',         // API 分类列表 → 后端 @GetMapping("/api-types")
    allApiTypes: '/admin/api-types/all',  // 所有分类（不分页） → 后端 @GetMapping("/api-types/all")
    createApiType: '/admin/api-types',    // 创建分类 → 后端 @PostMapping("/api-types")
    orders: '/admin/orders',              // 订单列表（管理） → 后端 @GetMapping("/orders")
    statistics: '/admin/statistics',      // 平台统计 → 后端 @GetMapping("/statistics")
    requirements: '/admin/requirements'   // 需求列表（管理） → 后端 @GetMapping("/requirements")
  },

  /**
   * 用户标签模块 —— 对应后端 UserTagController
   * 路由前缀：/user-tag
   */
  userTag: {
    list: '/user-tag/list',               // 获取标签列表 → 后端 @GetMapping("/list")
    save: '/user-tag/save',               // 全量保存标签 → 后端 @PostMapping("/save")
    add: '/user-tag/add',                 // 添加单个标签 → 后端 @PostMapping("/add")
    remove: '/user-tag/remove'            // 删除单个标签 → 后端 @DeleteMapping("/remove")
  },

  /**
   * 智能匹配模块 —— 对应后端 MatchingController
   * 路由前缀：/matching
   * 基于用户标签与需求标签的 Levenshtein 编辑距离算法匹配
   */
  matching: {
    recommend: '/matching/recommend'      // 智能推荐需求 → 后端 @GetMapping("/recommend")
  }
}

/**
 * 导出默认配置对象，供 utils/request.ts 中的 Axios 实例使用
 * 【后端类比】相当于后端的 @ConfigurationProperties 注解读取配置
 */
export default config
