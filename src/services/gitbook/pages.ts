import { AxiosResponse } from 'axios';
import { gitbookAPI } from '../../API/gitbook-api';
import { Page } from '../../interfaces';

export const getPageContent: (id: string, url: string) => Promise<AxiosResponse<Page>>
    = (idSpace, url) => gitbookAPI.get(`/v1/spaces/${idSpace}/content/url/${url}`);