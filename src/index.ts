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
const dir = `C:\\Users\\salvatore\\Desktop\\dev\\nodejs-gitbook\\.tmp\\${now.valueOf()}`;

const aReturnDocument = [];
const initialize = async () => {
    console.log('Initializing...');
    // let client;
    // try {
    //     client = await redisClient();
    // } catch (error) {
    debugger;
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

// create generator for pages recursively
async function* getAsyncPageContent(spaceId: string, pages: Page[], path?: string) {
    console.log(path)
    for await (const page of pages) {
        try {
            let currentPath = page.path
            if (!!path) currentPath = `${path}/${page.path}`
            if (page.kind === 'group') {
                !existsSync(`${dir}\\${spaceId}\\${currentPath}`) && mkdirSync(`${dir}\\${spaceId}\\${currentPath}`);
                yield* getAsyncPageContent(spaceId, page.pages, currentPath);
            } else if (page.kind === 'sheet') {
                if (page.pages.length > 0) {
                    !existsSync(`${dir}\\${spaceId}\\${currentPath}`) && mkdirSync(`${dir}\\${spaceId}\\${currentPath}`);
                    yield* getAsyncPageContent(spaceId, page.pages, currentPath);
                }
                yield { ...(await getPageContent(spaceId, currentPath)).data, currentPath: `${dir}\\${spaceId}\\${currentPath}` };
            } else {
                console.log(`not supported: ${page.kind}`)
            }
        } catch (error) {
            debugger;
        }
    }
}

// Top Level await
(async () => {
    console.log('START')
    const { spaces, user } = await initialize();
    console.log('initialize', spaces, user)

    const filtered = spaces.filter((f: Space) =>
        // f.id === '-MM7UqEjtRty47ksGOvA' || 
        f.id === 'UULCWDT5W9w2sMu9EQY0');

    const retrieve = getAsyncSpaceContent(filtered);

    !existsSync(dir) && mkdirSync(dir);

    for await (const space of retrieve) {
        const retrievePage = getAsyncPageContent(space.spaceId, space.content.pages);

        !existsSync(`${dir}\\${space.spaceId}`) && mkdirSync(`${dir}\\${space.spaceId}`);

        for await (const page of retrievePage) {
            if (page) {
                // gestire tutto qui...
                const md = gitbookDocumentToMd(page.document, space.content.files);
                try {
                    writeFileSync(`${page.currentPath}.md`, json2md(md.filter((m => !!m))).toString());
                } catch (error) {
                    debugger;
                }
                // aReturnDocument.push({
                //     dir: page.currentPath, // `${dir}\\${space.spaceId}\\${page.path}`,
                //     document: page.document,
                //     files: space.content.files
                // })
            }
        }
    }


    // aReturnDocument.map(({ dir, document, files }) => {
    //     const md = gitbookDocumentToMd(document, files);

    //     // console.log('md', JSON.stringify(md.filter((m => !!m)), null, 2))
    //     // console.log(json2md(md.filter((m => !!m))))

    //     try {
    //         writeFileSync(`${dir}.md`, json2md(md.filter((m => !!m))).toString());
    //     } catch (error) {
    //         debugger;
    //     }
    // })

    console.log('retrieve - end', retrieve)

    console.log('END')
    // console.log(res);
    // process.exit(1)
})();