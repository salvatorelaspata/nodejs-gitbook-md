"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitbookAPI = void 0;
var axios_1 = require("axios");
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var _a = process.env, GITBOOK_API_URL = _a.GITBOOK_API_URL, GITBOOK_API_KEY = _a.GITBOOK_API_KEY;
exports.gitbookAPI = axios_1.default.create({
    baseURL: GITBOOK_API_URL,
    headers: { Authorization: 'Bearer ' + GITBOOK_API_KEY },
});
//# sourceMappingURL=gitbook-api.js.map