import { AxiosResponse } from 'axios';
import { gitbookAPI } from '../../API/gitbook-api';
import { Spaces } from '../../interfaces/index';

export const getSpaceContent: (id: string) => Promise<AxiosResponse<Spaces>>
    = (id) => gitbookAPI.get(`/v1/spaces/${id}/content`);
export const getPageContent: (id: string, url: string) => Promise<AxiosResponse<any>>
    = (idSpace, url) => gitbookAPI.get(`/v1/spaces/${idSpace}/content/url/${url}`);