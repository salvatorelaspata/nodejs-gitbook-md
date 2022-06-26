import { AxiosResponse } from 'axios';
import { gitbookAPI } from '../../API/gitbook-api';
import { Spaces } from '../../interfaces/index';

export const getSpaceContent: (id: string) => Promise<AxiosResponse<Spaces>>
    = (id) => gitbookAPI.get(`/v1/spaces/${id}/content`);