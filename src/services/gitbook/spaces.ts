import { AxiosResponse } from 'axios';
import { gitbookAPI } from '../../api/gitbook-api';
import { Spaces } from '../../interfaces/index';

export const getSpaceContent: (id: string) => Promise<AxiosResponse<Spaces>>
    = (id) => {
        console.log(`/v1/spaces/${id}/content`)
        return gitbookAPI.get(`/v1/spaces/${id}/content`)
    };
export const getPageContent: (id: string, url: string) => Promise<AxiosResponse<any>>
    = (idSpace, url, debugMode = true) => {
        debugMode && console.log(`/v1/spaces/${idSpace}/content/url/${url}`)
        return gitbookAPI.get(`/v1/spaces/${idSpace}/content/url/${url}`)
    };