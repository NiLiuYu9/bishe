const config = {
  baseURL: 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
}

export const apiEndpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    userInfo: '/auth/user-info',
    updateUserInfo: '/auth/user-info',
    updatePassword: '/auth/password'
  },
  accessKey: {
    info: '/user/accessKey/info',
    regenerate: '/user/accessKey/regenerate'
  },
  quota: {
    list: '/quota/list'
  },
  api: {
    list: '/api/list',
    detail: '/api/detail',
    create: '/api/create',
    update: '/api/update',
    updateStatus: '/api/updateStatus',
    myApis: '/api/getApis',
    statistics: '/api/statistics',
    myInvokeStatistics: '/api/statistics/my-invoke',
    myApiInvokeStatistics: '/api/statistics/my-api-invoke',
    apiTypes: '/api/api-types'
  },
  favorite: {
    add: '/favorite/add',
    remove: '/favorite/remove',
    check: '/favorite/check',
    list: '/favorite/list'
  },
  trade: {
    purchase: '/order/create',
    orders: '/order/list',
    orderDetail: '/order/detail',
    updateStatus: '/order/update-status',
    delete: '/order/delete',
    evaluate: '/order/rate',
    pay: '/order/pay',
    queryPayStatus: '/order/pay/query'
  },
  test: {
    testCall: '/test/call',
    recordCount: '/test/records/count',
    saveRecord: '/test/save-record',
    records: '/test/records',
    deleteRecord: '/test/records'
  },
  requirement: {
    list: '/requirement/list',
    detail: '/requirement/detail',
    create: '/requirement/create',
    update: '/requirement/update',
    delete: '/requirement/delete',
    apply: '/requirement/apply',
    withdrawApply: '/requirement/withdraw-apply',
    selectApplicant: '/requirement/select-applicant',
    complete: '/requirement/complete',
    cancel: '/requirement/cancel',
    deliver: '/requirement/deliver',
    confirmDelivery: '/requirement/confirm-delivery',
    myRequirements: '/requirement/my-requirements'
  },
  whitelist: {
    add: '/whitelist/add',
    remove: '/whitelist/remove',
    list: '/whitelist/list',
    enable: '/whitelist/enable',
    disable: '/whitelist/disable'
  },
  review: {
    create: '/review/create',
    publisherReply: '/review/publisher/reply',
    update: '/review/update',
    delete: '/review/delete',
    userReply: '/review/user/reply',
    list: '/review/list',
    myReviews: '/review/my-reviews',
    detail: '/review/detail'
  },
  afterSale: {
    create: '/requirement/after-sale/create',
    respond: '/requirement/after-sale/respond',
    decide: '/requirement/after-sale/decide',
    detail: '/requirement/after-sale/detail',
    list: '/requirement/after-sale/list',
    myAfterSales: '/requirement/after-sale/my-after-sales',
    developerAfterSales: '/requirement/after-sale/developer-after-sales',
    messages: '/requirement/after-sale/messages',
    sendMessage: '/requirement/after-sale/message/send'
  },
  admin: {
    users: '/admin/users',
    freezeUser: '/admin/users',
    unfreezeUser: '/admin/users',
    exportUsers: '/admin/users/export',
    apis: '/admin/apis',
    apiTypes: '/admin/api-types',
    allApiTypes: '/admin/api-types/all',
    createApiType: '/admin/api-types',
    orders: '/admin/orders',
    statistics: '/admin/statistics',
    requirements: '/admin/requirements'
  },
  userTag: {
    list: '/user-tag/list',
    save: '/user-tag/save',
    add: '/user-tag/add',
    remove: '/user-tag/remove'
  },
  matching: {
    recommend: '/matching/recommend'
  }
}

export default config
