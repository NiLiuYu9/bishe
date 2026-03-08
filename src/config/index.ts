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
    delete: '/api/delete',
    myApis: '/api/getApis',
    audit: '/api/audit',
    statistics: '/api/statistics',
    apiTypes: '/api/api-types'
  },
  trade: {
    purchase: '/order/create',
    orders: '/order/list',
    orderDetail: '/order/detail',
    updateStatus: '/order/update-status',
    delete: '/order/delete',
    evaluate: '/order/evaluate'
  },
  test: {
    testCall: '/test/call',
    saveRecord: '/test/save-record',
    records: '/test/records'
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
    updateOrderStatus: '/admin/updateOrderStatus',
    statistics: '/admin/statistics',
    requirements: '/admin/requirements',
    requirementDetail: '/admin/requirements',
    updateRequirementStatus: '/admin/updateRequirementStatus'
  }
}

export default config
