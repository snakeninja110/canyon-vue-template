const upload = require("./upload");
const path = require("path");

// 混合不需要上传
module.exports = function (callback) {
    upload(path.resolve(__dirname, "..", "..", "dist"), callback);
}