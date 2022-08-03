import { gitbookAPI } from '../../api/gitbook-api.js'

export const getLoggedUser = gitbookAPI.get('/v1/user')
export const getUserSpaces = gitbookAPI.get('/v1/user/spaces')
