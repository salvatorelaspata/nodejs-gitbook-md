/* eslint-disable yield-star-spacing */
/* eslint-disable generator-star-spacing */
import { mkdir, writeFile, stat } from "fs/promises";
import { join } from "path";
import { getLoggedUser, getUserSpaces } from "./services/gitbook/user.js";
import { getPageContent, getSpaceContent } from "./services/gitbook/spaces.js";
import { gitbookDocumentToMd } from "./services/gitbook/document.js";
// import { redisClient } from './services/redis/index'
// import pino from 'pino'
import json2md from "json2md";

// initialization
// const log = pino()
const now = new Date();
// const dir = `C:\\Users\\salvatore\\Desktop\\dev\\nodejs-gitbook\\.tmp\\${now.valueOf()}`
// const dir = `.\\${now.valueOf()}`
console.log(import.meta.url.split(":")[1]);
let dir = join(import.meta.url.split(":")[1], "../tmp");

const initialize = async () => {
  console.log("Initializing...");
  const { data: user } = await getLoggedUser;
  const {
    data: { items: spaces },
  } = await getUserSpaces;
  debugger;
  await _createFolderIfNotExists("");
  await _createFolderIfNotExists(now.valueOf().toString());
  return { user, spaces };
};

async function* getAsyncSpaceContent(spaces) {
  for (const space of spaces) {
    let spaceContent;
    try {
      spaceContent = (await getSpaceContent(space.id)).data;
    } catch (error) {
      console.log(error);
    }
    yield { spaceId: space.id, content: spaceContent };
  }
}

// create generator for pages recursively
async function* getAsyncPageContent(spaceId, pages, path) {
  for await (const page of pages) {
    debugger;
    try {
      let currentPath = page.path;
      if (path) currentPath = encodeURIComponent(page.path); // `${path}/${page.path}`
      if (page.kind === "group") {
        debugger;
        // !existsSync(`${dir}\\${spaceId}\\${currentPath}`) && mkdirSync(`${dir}\\${spaceId}\\${currentPath}`)
        await _createFolderIfNotExists(join(spaceId, currentPath));
        yield* getAsyncPageContent(spaceId, page.pages, currentPath);
      } else if (page.kind === "sheet") {
        if (page.pages.length > 0) {
          // !existsSync(`${dir}\\${spaceId}\\${currentPath}`) && mkdirSync(`${dir}\\${spaceId}\\${currentPath}`)
          await _createFolderIfNotExists(join(spaceId, currentPath));
          yield* getAsyncPageContent(spaceId, page.pages, currentPath);
        }
        yield {
          ...(await getPageContent(spaceId, currentPath)).data,
          currentPath: join(dir, spaceId, currentPath), // `${dir}\\${spaceId}\\${currentPath}`
        };
      } else if (page.kind === "link") {
        await _createFile(
          join(dir, spaceId, currentPath.replace("undefined", page.uid)),
          page.href
        );
        yield null;
      } else {
        console.log(`not supported: ${page.kind}`);
      }
    } catch (error) {
      console.log(error);
    }
  }
}

/**
 * Create folder if not exists
 * @param path string - path to folder
 */
const _createFolderIfNotExists = async (path) => {
  debugger;
  const folderDest = join(dir, path);
  try {
    await stat(folderDest);
  } catch (_) {
    try {
      await mkdir(folderDest);
    } catch (errorMkDir) {
      console.log("[mkdir] _createFolderIfNotExists - error", errorMkDir);
    }
  }
};

/**
 * Create file if not exists
 * @param path string - path to file
 * @param content string - content of file
 */
const _createFile = async (path, content) => {
  try {
    await stat(path);
  } catch (_) {
    try {
      await writeFile(path, content);
    } catch (errorMkDir) {
      console.log("[mkdir] _createFile - error", errorMkDir);
    }
  }
};

// Top Level await
(async () => {
  console.log("START");
  const { spaces, user } = await initialize();
  console.log("initialize", spaces, user);

  // const filtered = spaces.filter((f) => //   f.id === '-MM7UqEjtRty47ksGOvA' || f.id === 'UULCWDT5W9w2sMu9EQY0')
  const retrieve = getAsyncSpaceContent(spaces);

  // !existsSync(dir) && mkdirSync(dir)
  await _createFolderIfNotExists("");
  console.log("retrieve - start");

  for await (const space of retrieve) {
    const retrievePage = getAsyncPageContent(
      space.spaceId,
      space.content.pages
    );
    // !existsSync(`${dir}\\${space.spaceId}`) && mkdirSync(`${dir}\\${space.spaceId}`)
    await _createFolderIfNotExists(space.spaceId);

    for await (const page of retrievePage) {
      if (page) {
        const md = gitbookDocumentToMd(page.document, space.content.files);
        // try {
        //     writeFileSync(`${page.currentPath}.md`, json2md(md.filter((m => !!m))).toString())
        // } catch (error) {
        //     debugger
        // }
        await _createFile(
          `${page.currentPath}.md`,
          json2md(md.filter((m) => !!m)).toString()
        );
      }
    }
  }

  console.log("retrieve - end");
  console.log("END");
  process.exit(0);
})();
