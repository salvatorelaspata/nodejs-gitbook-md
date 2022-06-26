import { AxiosResponse } from 'axios';
import { Page, Spaces, User, UserSpaces } from './interfaces/index';

import pino from 'pino';
import { getLoggedUser, getPageContent, getSpaceContent, getUserCollections, getUserSpaces } from './services/gitbook';

const log = pino();
// TODO - COMMON: Gestire token (Gitbook, Notion)
// TODO - GITBOOK: FROM Gitbook API
const initialize = async () => {
    log.info('Initializing...');
    // cache invalidation...
    debugger;
    // Get logged User
    try {

        const { data: user }: AxiosResponse<User> = await getLoggedUser;
        log.info(`User: ${JSON.stringify(user, null, 2)}`);
    } catch (error) {
        console.log(`UserError: ${error}`);
    }

    // Retrieve User Spaces
    try {
        const { data: { items: spaces } }: AxiosResponse<UserSpaces> = await getUserSpaces;
        log.info(`UserSpaces: ${JSON.stringify(spaces, null, 2)}`);
    } catch (error) {
        console.log(`UserSpacesError: ${error}`);
    }
    // Retrieve User Collections
    // try {
    // const { data: { items: collections } }: AxiosResponse<any> = await getUserCollections;
    // log.info(`UserCollections: ${JSON.stringify(collections, null, 2)}`);
    // } catch (error) {
    //     console.log(`UserCollectionsError: ${error}`);
    // }

    // if (spaces.length > 0) {
    //     await Promise.all(spaces.map(async (e) => {
    //         const { data: space }: AxiosResponse<Spaces> = await getSpaceContent(e.id);

    //         if (space.pages.length > 0 && e.id === 'UULCWDT5W9w2sMu9EQY0') { // '-MM7UqEjtRty47ksGOvA'
    //             // Retrieve Space Page Content - Implementate Recursive mode
    //             log.info('space.pages.length > 0');
    //             const pages = await _recursivePageContent(space.pages, e.id);
    //             e.pages = pages;
    //         }

    //         return e;
    //     }));
    // }
};


// const _recursivePageContent = async (pages: Page[], currentSpace: string, rootPath: string = '') => {
//     // for (let index = 0; index < pages.length; index++) {
//     return await Promise.all(pages.map(async (e: Page) => {
//         // const e = pages[index];
//         debugger;
//         // const e = pages[index];
//         if (e.kind === 'sheet') {
//             try {
//                 const res = await getPageContent(currentSpace, rootPath + e.path);
//                 e.document = res.data.document;
//                 log.info(` ***SUCCESS*** /v1/spaces/${currentSpace}/content/url/${rootPath}${e.path}`);
//             } catch (error) {
//                 log.error(` ***ERROR**** /v1/spaces/${currentSpace}/content/url/${rootPath}${e.path}`);
//             }
//         }

//         if (e.pages && Array.isArray(e.pages) && e.pages.length > 0 || e.kind !== 'link') {
//             // aggiorno la root path per il prossimo livello di ricorsione (se esiste)
//             rootPath = rootPath + e.path + '/';
//             await _recursivePageContent(e.pages, currentSpace, rootPath);
//         }
//         return e;
//     }));

// }

// Top Level await
(async () => {
    log.info('START')
    const res = await initialize();
    log.info('END')
    // log.info(res);
    // process.exit(1)
})();