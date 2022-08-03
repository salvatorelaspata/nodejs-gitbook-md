import { gitbookAPI } from '../../api/gitbook-api.js'

export const getSpaceContent = (id) => {
  console.log(`/v1/spaces/${id}/content`)
  return gitbookAPI.get(`/v1/spaces/${id}/content`)
}
export const getPageContent = (idSpace, url, debugMode = true) => {
  debugMode && console.log(`/v1/spaces/${idSpace}/content/path/${url}`)
  return gitbookAPI.get(`/v1/spaces/${idSpace}/content/path/${url}`)
}
