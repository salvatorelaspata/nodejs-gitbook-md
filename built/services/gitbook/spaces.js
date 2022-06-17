"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPageContent = exports.getSpaceContent = void 0;
var gitbook_api_1 = require("../../API/gitbook-api");
var getSpaceContent = function (id) {
    return gitbook_api_1.gitbookAPI.get("/v1/spaces/".concat(id, "/content"));
};
exports.getSpaceContent = getSpaceContent;
var getPageContent = function (idSpace, url) {
    return gitbook_api_1.gitbookAPI.get("/v1/spaces/".concat(idSpace, "/content/url/").concat(url));
};
exports.getPageContent = getPageContent;
//# sourceMappingURL=spaces.js.map