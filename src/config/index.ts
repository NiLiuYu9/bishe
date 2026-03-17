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
    add: '/api/favorite/add',
    remove: '/api/favorite/remove',
    check: '/api/favorite/check',
    list: '/api/favorite/list'
  },
  trade: {
    purchase: '/order/create',
    orders: '/order/list',
    orderDetail: '/order/detail',
    updateStatus: '/order/update-status',
    delete: '/order/delete',
    evaluate: '/order/rate'
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
    myRequirements: '/requirement/my-requirements'
  },
  admin: {
    users: '/admin/users',
    freezeUser: '/admin/users',
    unfreezeUser: '/admin/users',
    apis: '/admin/apis',
    apiTypes: '/admin/api-types',
    allApiTypes: '/admin/api-types/all',
    createApiType: '/admin/api-types',
    orders: '/admin/orders',
    statistics: '/admin/statistics',
    requirements: '/admin/requirements'
  }
}

export default config
