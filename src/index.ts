import { AxiosResponse } from 'axios';
import { Page, Space, Spaces, User, UserSpaces } from './interfaces/index';

import { getLoggedUser, getUserSpaces } from './services/gitbook/user';
import { redisClient } from './services/redis/index';
import {
    getPageContent,
    getSpaceContent,
} from './services/gitbook/spaces';
import pino from 'pino';

const log = pino();
// TODO - COMMON: Gestire token (Gitbook, Notion)
// TODO - GITBOOK: FROM Gitbook API
const initialize = async () => {
    log.info('Initializing...');
    const client = await redisClient();
    // log.info('await redisClient()');
    // let oReturn = [];
    // Retrieve User Info
    // Check if user is in redis
    const user: User = JSON.parse(await client.get('user'));
    // log.info('await client.get(user)');
    if (!user) {
        const { data: _ }: AxiosResponse<User> = await getLoggedUser;
        await client.set('user', JSON.stringify(_));
        // log.info('await getLoggedUser');
    }
    log.info(`User: ${JSON.stringify(user, null, 2)}`);
    // Retrieve User Spaces
    // Check if userSpaces is in redis
    let spaces: Space[] = JSON.parse(await client.get('userSpaces'));
    log.info(`UserSpaces: ${JSON.stringify(spaces, null, 2)}`);
    if (!spaces) {
        const resUserSpaces: AxiosResponse<UserSpaces> = await getUserSpaces;
        client.set('userSpaces', JSON.stringify(resUserSpaces.data.items));
        // log.info('await getLoggedUser');
        spaces = resUserSpaces.data.items;
    }

    // https://www.youtube.com/watch?v=l2CA9FtW1Pw
    // VEDERE VIDEO!

    // TODO - GITBOOK: Retrieve Collections
    // const { data: { items: collections} }: AxiosResponse<UserCollections> = await getUserCollections;
    if (spaces.length > 0) {
        log.info(`spaces.length: ${spaces.length}`);
        // for (let index = 0; index < spaces.length; index++) {
        await Promise.all(spaces.map(async (e) => {
            // log.info('spaces.length > 0');
            // const returned = await Promise.all(spaces.map(async (e: Space) => {

            // for await (const e of spaces) {
            // const e = spaces[index];
            // For Each Spaces Retrieve Space General Content
            //Check if space content is in redis
            let space: Spaces = JSON.parse(await client.get(`spaceContent_${e.id}`));
            // log.info(`await client.get(spaceContent_${e.id})`);
            if (!space) {
                const spaceContent: AxiosResponse<Spaces> = await getSpaceContent(e.id);
                await client.set(`spaceContent_${e.id}`, JSON.stringify(spaceContent.data));
                space = spaceContent.data;
            }

            if (space.pages.length > 0 && e.id === 'UULCWDT5W9w2sMu9EQY0') { // '-MM7UqEjtRty47ksGOvA'
                // Retrieve Space Page Content - Implementate Recursive mode
                log.info('space.pages.length > 0');
                const pages = await _recursivePageContent(space.pages, e.id);
                e.pages = pages;
            }
            return e; // oReturn.push({ ...e });
        }));
    }
    // log.info({ returned });

    // return oReturn;
};




const _recursivePageContent = async (pages: Page[], currentSpace: string, rootPath: string = '') => {
    // for (let index = 0; index < pages.length; index++) {
    return await Promise.all(pages.map(async (e: Page) => {
        // const e = pages[index];
        debugger;
        // const e = pages[index];
        if (e.kind === 'sheet') {
            try {
                const res = await getPageContent(currentSpace, rootPath + e.path);
                e.document = res.data.document;
                log.info(` ***SUCCESS*** /v1/spaces/${currentSpace}/content/url/${rootPath}${e.path}`);
            } catch (error) {
                log.error(` ***ERROR**** /v1/spaces/${currentSpace}/content/url/${rootPath}${e.path}`);
            }
        }

        if (e.pages && Array.isArray(e.pages) && e.pages.length > 0 || e.kind !== 'link') {
            // aggiorno la root path per il prossimo livello di ricorsione (se esiste)
            rootPath = rootPath + e.path + '/';
            await _recursivePageContent(e.pages, currentSpace, rootPath);
        }
        return e;
    }));

}

// Top Level await
(async () => {
    log.info('START')
    const res = await initialize();
    log.info('END')
    // log.info(res);
    // process.exit(1)
})();