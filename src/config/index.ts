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
    userInfo: '/auth/userInfo',
    updateUserInfo: '/auth/updateUserInfo',
    updatePassword: '/auth/updatePassword'
  },
  api: {
    list: '/api/list',
    detail: '/api/detail',
    create: '/api/create',
    update: '/api/update',
    delete: '/api/delete',
    myApis: '/api/my-apis',
    audit: '/api/audit',
    statistics: '/api/statistics'
  },
  trade: {
    purchase: '/trade/purchase',
    orders: '/trade/orders',
    orderDetail: '/trade/order-detail',
    evaluate: '/trade/evaluate'
  },
  test: {
    testCall: '/test/call',
    saveRecord: '/test/save-record',
    records: '/test/records'
  },
  requirement: {
    list: '/requirement/list',
    create: '/requirement/create',
    update: '/requirement/update',
    delete: '/requirement/delete',
    apply: '/requirement/apply',
    myRequirements: '/requirement/my-requirements'
  },
  admin: {
    users: '/admin/users',
    userDetail: '/admin/user-detail',
    freezeUser: '/admin/users',
    unfreezeUser: '/admin/users',
    apis: '/admin/apis',
    auditApi: '/admin/audit-api',
    apiTypes: '/admin/api-types',
    createApiType: '/admin/api-types',
    updateApiType: '/admin/api-types',
    deleteApiType: '/admin/api-types',
    orders: '/admin/orders',
    statistics: '/admin/statistics'
  }
}

export default config
