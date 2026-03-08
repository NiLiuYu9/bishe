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
  api: {
    list: '/api/list',
    detail: '/api/detail',
    create: '/api/create',
    update: '/api/update',
    delete: '/api/delete',
    myApis: '/api/getApis',
    audit: '/api/audit',
    statistics: '/api/statistics',
    apiTypes: '/api/api-types'
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
    updateApiStatus: '/admin/updateApiStatus',
    apiTypes: '/admin/api-types',
    allApiTypes: '/admin/api-types/all',
    createApiType: '/admin/api-types',
    updateApiType: '/admin/api-types',
    updateApiTypeStatus: '/admin/updateApiTypeStatus',
    orders: '/admin/orders',
    statistics: '/admin/statistics'
  }
}

export default config
