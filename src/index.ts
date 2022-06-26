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
const log = pino();


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

// create generator for pages recursively
async function* getAsyncPageContent(spaceId: string, pages: Page[]) {
    for await (const page of pages) {
        // debugger;
        try {
            if (page.kind === 'sheet') {
                yield (await getPageContent(spaceId, page.path)).data;
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
    const filtered = spaces.filter((f: Space) => f.id === '-MM7UqEjtRty47ksGOvA')
    const retrieve = getAsyncSpaceContent(filtered);
    console.log('retrieve - start', retrieve)
    const sSeet = new Set()

    var fs = require('fs');
    const now = new Date();
    var dir = `C:\\Users\\salvatore\\Desktop\\dev\\nodejs-gitbook\\.tmp\\${now.valueOf()}`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const aReturn = [];
    const aReturnDocument = [];
    for await (const space of retrieve) {
        console.log('space', space)
        const retrievePage = getAsyncPageContent(space.spaceId, space.content.pages);
        for await (const page of retrievePage) {
            // console.log(`page: ${JSON.stringify(page, null, 2)}`);
            aReturn.push(page);

            console.log(page)
            if (page) {
                if (!fs.existsSync(dir + '\\' + space.spaceId)) {
                    fs.mkdirSync(dir + '\\' + space.spaceId);
                }
                aReturnDocument.push({ dir: `${dir}\\${space.spaceId}\\${page.path}`, document: page.document, files: space.content.files });
                page.document.nodes.map((n) => sSeet.add(n.type))
            }
            // debugger;
        }
    }
    console.log(sSeet)
    console.log(aReturn)
    console.log(aReturnDocument)

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    const aArray = []
    aReturnDocument.map(({ dir, document, files }) => {
        const md = gitbookDocumentToMd(document, files);
        aArray.push(md);

        console.log('md', JSON.stringify(md.filter((m => !!m)), null, 2))

        console.log(json2md(md.filter((m => !!m))))
        fs.writeFile(`${dir}.md`, json2md(md.filter((m => !!m))).toString(), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    })
    console.log(aArray)
    debugger;
    console.log('retrieve - end', retrieve)

    console.log('END')
    // console.log(res);
    // process.exit(1)
})();