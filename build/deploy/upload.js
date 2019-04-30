/*eslint-disable*/
const fs = require("fs");
// const file = require('./file')
const Leonid = require("./leonid");
const config = require("./config");
const path = require("path");

let leonid = new Leonid({
    userToken: config.userToken,
    bucket: config.bucket,
    api: config.api,
    assetKey: config.assetKey
});

/***
 * 上传狮子座
 * @param {stirng} file 需要上传的文件路径
 * @param {string} target 上传到狮子座的子目录
 */
function upload({
    filePath,
    target
}, callback) {
    let fileName = (target || "") + filePath.split(/[\/\\]/).pop();
    console.log("upload:", fileName);
    leonid
        .upload(filePath, target)
        .then(res => {
            let msg = null;
            if (res.code !== 0) {
                msg = `CDN环节报错，进程已终止，自动发布失败 - ${fileName}: \nfail, api error msg: ${res.msg}, api error code: ${res.code}`;
            }
            callback && callback(msg);
        })
        .catch(e => {
            callback && callback(`CDN环节报错，进程已终止，自动发布失败 - ${fileName}: \n${e.toString()}`);
        });
}

var baseAppDir;

/**
 *
 * @param {string} base 需要上传文件所在的目录
 * @param {string} relative 所在目录的子目录（相对地址）
 * @param {string} ignore 不需要上传的文件
 */
function uploadRecu(base, relative, arr = []) {
    let filePath = relative ? path.join(base, relative) : base;
    let ignore = ".json|.html|.map|server-bundle|.appcache";
    fs.readdirSync(filePath).forEach(item => {
        let tempPath = path.resolve(filePath, item);
        if (tempPath == baseAppDir) {
            // 混合目录，不必上次
            return;
        }
        if (fs.lstatSync(tempPath).isDirectory()) {
            if (relative) {
                uploadRecu(base, path.join(relative, item), arr);
            } else {
                uploadRecu(base, item, arr);
            }
        } else {
            if (
                new RegExp(ignore).test(item) ||
                item
                .split("/")
                .pop()
                .indexOf("_") == 0
            ) {
                console.log("skip:", item);
                return;
            }

            if (relative) {
                arr.push({
                    filePath: path.join(base, relative, item),
                    target: path.join("/", relative, "/").replace(/\\/g, "/")
                })
            } else {
                arr.push({
                    filePath: path.join(base, item) + "/" + item
                })
            }
        }
    });
    return arr;
}

module.exports = function (base, callback) {
    console.log(">>>>>>>>>>>>>>>上传CDN开始<<<<<<<<<<<<<<<<<<");
    baseAppDir = path.resolve(base, "app");
    let uploadArr = uploadRecu(base);

    function next(msg) {
        if (msg) {
            console.warn("\x1B[31m >>>>>>>>>>>>>>>" + msg + "<<<<<<<<<<<<<<<<<< \x1B[0m");
            callback && callback();
            return;
        }
        if (uploadArr.length == 0) {
            console.log(">>>>>>>>>>>>>>>上传全部完成<<<<<<<<<<<<<<<<<<");
            callback && callback();
            return;
        }
        upload(uploadArr.shift(), next);
    }

    next();
};