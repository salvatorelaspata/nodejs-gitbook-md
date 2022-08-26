import { AxiosResponse } from "axios";
import { mkdir, writeFile, stat } from "fs/promises";
import { join } from "path";
import { Page, Space, User, UserSpaces } from "./interfaces/index";
import { getLoggedUserTS, getUserSpacesTS } from "./services/gitbook/user";
import { getPageContentTS, getSpaceContentTS } from "./services/gitbook/spaces";
import { gitbookDocumentToMdTS } from "./services/gitbook/document";
// import { redisClient } from './services/redis/index'
// import pino from 'pino'
import json2md from "json2md";
import { homedir } from "os";

// initialization
// const log = pino()
const now = new Date();
// const dir = `C:\\Users\\salvatore\\Desktop\\dev\\nodejs-gitbook\\.tmp\\${now.valueOf()}`
// const dir = `.\\${now.valueOf()}`
console.log(homedir());
const dir = join(homedir(), "../tmp");

const initialize = async () => {
	console.log("Initializing...");
	const { data: user }: AxiosResponse<User> = await getLoggedUserTS;
	const {
		data: { items: spaces },
	}: AxiosResponse<UserSpaces> = await getUserSpacesTS;
	await _createFolderIfNotExists("");
	await _createFolderIfNotExists(now.valueOf().toString());
	return { user, spaces };
};

async function* getAsyncSpaceContent(spaces: Space[]) {
	for (const space of spaces) {
		let spaceContent;
		try {
			spaceContent = (await getSpaceContentTS(space.id)).data;
		} catch (error) {
			console.log(error);
		}
		yield { spaceId: space.id, content: spaceContent };
	}
}

// create generator for pages recursively
const getAsyncPageContent: (
	spaceId: string,
	pages: Page[],
	path?: string
) => any = async function* (spaceId, pages, path?) {
	for await (const page of pages) {
		try {
			let currentPath = page.path as string;
			if (path) currentPath = encodeURIComponent(page.path as string); // `${path}/${page.path}`
			if (page.kind === "group") {
				// !existsSync(`${dir}\\${spaceId}\\${currentPath}`) && mkdirSync(`${dir}\\${spaceId}\\${currentPath}`)
				await _createFolderIfNotExists(join(spaceId, currentPath));
				yield* getAsyncPageContent(spaceId, page.pages as Page[], currentPath);
			} else if (page.kind === "sheet") {
				if (page.pages && page.pages.length > 0) {
					// !existsSync(`${dir}\\${spaceId}\\${currentPath}`) && mkdirSync(`${dir}\\${spaceId}\\${currentPath}`)
					await _createFolderIfNotExists(join(spaceId, currentPath));
					yield* getAsyncPageContent(
						spaceId,
						page.pages as Page[],
						currentPath
					);
				}
				yield {
					...(await getPageContentTS(spaceId, currentPath)).data,
					currentPath: join(dir, spaceId, currentPath), // `${dir}\\${spaceId}\\${currentPath}`
				};
			} else if (page.kind === "link") {
				await _createFile(
					join(dir, spaceId, currentPath.replace("undefined", page.uid)),
					page.href || ""
				);
				yield null;
			} else {
				console.log(`not supported: ${page.kind}`);
			}
		} catch (error) {
			console.log(error);
		}
	}
};

/**
 * Create folder if not exists
 * @param path string - path to folder
 */
const _createFolderIfNotExists = async (path: string) => {
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
const _createFile = async (path: string, content: string) => {
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

	const filtered = spaces.filter(
		(f: Space) =>
			//   f.id === '-MM7UqEjtRty47ksGOvA' ||
			f.id === "UULCWDT5W9w2sMu9EQY0"
	);
	const retrieve = getAsyncSpaceContent(spaces);

	// !existsSync(dir) && mkdirSync(dir)
	await _createFolderIfNotExists("");
	console.log("retrieve - start");

	for await (const space of retrieve) {
		const { spaceId, content } = space;
		const retrievePage = getAsyncPageContent(spaceId, content?.pages || []);
		// !existsSync(`${dir}\\${spaceId}`) && mkdirSync(`${dir}\\${spaceId}`)
		await _createFolderIfNotExists(spaceId);

		for await (const page of retrievePage) {
			if (page) {
				const md = gitbookDocumentToMdTS(page.document, content?.files || []);
				// try {
				//     writeFileSync(`${page.currentPath}.md`, json2md(md.filter((m => !!m))).toString())
				// } catch (error) {
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
