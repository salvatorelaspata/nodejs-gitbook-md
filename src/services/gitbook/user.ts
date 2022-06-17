import { AxiosResponse } from 'axios';
import { gitbookAPI } from '../../API/gitbook-api';
import { User, UserSpaces } from '../../interfaces/index';

export const getLoggedUser: Promise<AxiosResponse<User>> = gitbookAPI.get('/v1/user');
export const getUserSpaces: Promise<AxiosResponse<UserSpaces>> = gitbookAPI.get('/v1/user/spaces');
