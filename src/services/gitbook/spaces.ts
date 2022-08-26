/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import { gitbookAPITS } from "../../api/gitbook-api";
import { Spaces } from "../../interfaces/index";

export const getSpaceContentTS: (
	id: string
) => Promise<AxiosResponse<Spaces>> = (id) => {
	console.log(`/v1/spaces/${id}/content`);
	return gitbookAPITS.get(`/v1/spaces/${id}/content`);
};
export const getPageContentTS: (
	id: string,
	url: string
) => Promise<AxiosResponse<any>> = (idSpace, url, debugMode = true) => {
	debugMode && console.log(`/v1/spaces/${idSpace}/content/path/${url}`);
	return gitbookAPITS.get(`/v1/spaces/${idSpace}/content/path/${url}`);
};
