"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserSpaces = exports.getLoggedUser = void 0;
var gitbook_api_1 = require("../../API/gitbook-api");
exports.getLoggedUser = gitbook_api_1.gitbookAPI.get('/v1/user');
exports.getUserSpaces = gitbook_api_1.gitbookAPI.get('/v1/user/spaces');
//# sourceMappingURL=user.js.map