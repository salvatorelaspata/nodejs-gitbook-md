import { AxiosResponse } from 'axios'
import { gitbookAPITS } from '../../api/gitbook-api'
import { User, UserSpaces } from '../../interfaces/index'

export const getLoggedUserTS: Promise<AxiosResponse<User>> = gitbookAPITS.get('/v1/user')
export const getUserSpacesTS: Promise<AxiosResponse<UserSpaces>> = gitbookAPITS.get('/v1/user/spaces')
