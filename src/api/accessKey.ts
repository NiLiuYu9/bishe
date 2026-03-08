import { request, apiEndpoints } from '@/utils/request'

export interface AccessKeyInfo {
  id: number
  username: string
  accessKey: string
  secretKey: string
}

export const accessKeyApi = {
  getAccessKey() {
    return request.get<AccessKeyInfo>(apiEndpoints.accessKey.info)
  },

  regenerateAccessKey() {
    return request.post<AccessKeyInfo>(apiEndpoints.accessKey.regenerate)
  }
}
