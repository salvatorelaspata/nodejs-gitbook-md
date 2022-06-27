import { AxiosResponse } from 'axios';
import { Page, Space, Spaces, User, UserSpaces } from './interfaces/index';

import { getLoggedUser, getUserSpaces } from './services/gitbook/user';
import { redisClient } from './services/redis/index';
import {
    getPageContent,
    getSpaceContent,
} from './services/gitbook/spaces';
import pino from 'pino';
import { gitbookDocumentToMd } from './services/gitbook/document';
import json2md = require('json2md');
import { existsSync, mkdirSync, writeFileSync } from 'fs';

// initialization
const log = pino();
const now = new Date();
const aReturn = [];
const aReturnDocument = [];
const aMd = []
const initialize = async () => {
    console.log('Initializing...');
    // let client;
    // try {
    //     client = await redisClient();
    // } catch (error) {
    //     console.log(`Redis error: ${error}`);
    // }

    const { data: user }: AxiosResponse<User> = await getLoggedUser;
    // console.log(`User: ${JSON.stringify(user, null, 2)}`);

    const { data: { items: spaces } }: AxiosResponse<UserSpaces> = await getUserSpaces;
    // console.log(`spaces: ${JSON.stringify(spaces, null, 2)}`);

    return { user, spaces };
};


async function* getAsyncSpaceContent(spaces: Space[]) {
    for (const space of spaces) {
        let spaceContent;
        try {
            spaceContent = (await getSpaceContent(space.id)).data;
        } catch (error) {
            debugger;
        }
        yield { spaceId: space.id, content: spaceContent };
    }
}

// slow
const getAsyncSpaceContentNew = async (spaces: Space[]) => {
    return Promise.all(spaces.map(async (space) => ({
        spaceId: space.id,
        content: (await getSpaceContent(space.id)).data
    })));
}

const getAsyncSpaceContentNewOttimizzato = async (spaces: Space[]) => {
    return Promise.all(spaces.map(async (space) => ({
        spaceId: space.id,
        content: (await getSpaceContent(space.id)).data
    })));
}

// create generator for pages recursively
async function* getAsyncPageContent(spaceId: string, pages: Page[], path?: string) {
    console.log(path)
    for await (const page of pages) {
        // debugger;
        try {
            let currentPath = page.path
            if (!!path) currentPath = `${path}/${page.path}`
            if (page.kind === 'sheet') {
                yield (await getPageContent(spaceId, currentPath)).data;
            } else if (page.kind === 'group') {
                yield* getAsyncPageContent(spaceId, page.pages, currentPath);
            } else if (page.pages.length > 0) {
                yield* getAsyncPageContent(spaceId, page.pages, currentPath);
            }
            // else if (page.kind === 'group') {
            //     const group = await getAsyncPageContent(spaceId, page.pages);
            //     for await (const groupPage of group) {
            //         // solo 1 livello
            //         yield (await getPageContent(spaceId, `${page.path}/${groupPage.path}`)).data;
            //     }
            // }
        } catch (error) {
            // debugger;
        }
    }
}

// create generator for pages recursively
const getAsyncPageContentNew = async (spaceId: string, pages: Page[]) => {
    for await (const page of pages) {
        try {
            if (page.kind === 'sheet') {
                const ret = await getPageContent(spaceId, page.path);
                return ret.data
            } else if (page.kind === 'group') {
                const group = await getAsyncPageContent(spaceId, page.pages);
                return group;
            }
        } catch (error) {
            // debugger;
        }
    }
}

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
//                 console.log(` ***SUCCESS*** /v1/spaces/${currentSpace}/content/url/${rootPath}${e.path}`);
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
    console.log('START')
    const { spaces, user } = await initialize();
    console.log('initialize', spaces, user)

    const filtered = spaces.filter((f: Space) =>
        // f.id === '-MM7UqEjtRty47ksGOvA' || 
        f.id === 'UULCWDT5W9w2sMu9EQY0');

    debugger;
    console.time('getAsyncSpaceContent');
    const retrieve = await getAsyncSpaceContent(filtered);
    console.timeEnd('getAsyncSpaceContent');

    var dir = `C:\\Users\\salvatore\\Desktop\\dev\\nodejs-gitbook\\.tmp\\${now.valueOf()}`;
    !existsSync(dir) && mkdirSync(dir);

    for await (const space of retrieve) {
        const retrievePage = getAsyncPageContent(space.spaceId, space.content.pages);
        debugger;
        for await (const page of retrievePage) {
            aReturn.push(page);
            if (page) {
                !existsSync(`${dir}\\${space.spaceId}`) && mkdirSync(`${dir}\\${space.spaceId}`);

                aReturnDocument.push({
                    dir: `${dir}\\${space.spaceId}\\${page.path}`,
                    document: page.document,
                    files: space.content.files
                })
            }
        }
    }


    // aReturnDocument.map(({ dir, document, files }) => {
    //     const md = gitbookDocumentToMd(document, files);
    //     aMd.push(md);

    //     console.log('md', JSON.stringify(md.filter((m => !!m)), null, 2))
    //     console.log(json2md(md.filter((m => !!m))))

    //     try {
    //         writeFileSync(`${dir}.md`, json2md(md.filter((m => !!m))).toString());
    //         console.log(`${dir}.md - Saved!`)
    //     } catch (error) {
    //         console.log(`${dir}.md - Error! ${error}`)
    //     }
    // })

    console.log('retrieve - end', retrieve)

    console.log('END')
    // console.log(res);
    // process.exit(1)
})();