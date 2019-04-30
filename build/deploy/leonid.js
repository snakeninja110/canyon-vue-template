// const querystring = require('querystring')
const http = require("http");
const fs = require("fs");
const url = require("url");
const path = require("path");

class Leonid {
    constructor(options) {
        this.params = {
            bucketName: options.bucket,
            apiUrl: options.api,
            userToken: options.userToken,
            assetKey: options.assetKey
        };
        this.boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW";
    }

    /***
     * 上传文件
     * @param {string} file 需要上传的文件完整路径
     * @param {string} dirname 上传到狮子座中的路径，以“/”开头“/”结尾不包括包括文件名称 如： /flightnew/
     * @returns {Promise}
     */
    upload(file, dirname) {
        dirname = '/line-lt-sale' + dirname;
        let self = this;
        let URL = url.parse(this.params.apiUrl);
        let options = {
            method: "POST",
            hostname: URL.hostname,
            path: URL.path,
            headers: {
                "content-type": "multipart/form-data; boundary=" + this.boundary,
                "user-token": this.params.userToken,
                "asset-key": this.params.assetKey
            }
        };

        let filename = path.basename(file);
        let extname = path.extname(file);
        let mime = this.getMime(extname);

        return new Promise((resolve, reject) => {
            let request = http.request(options, function(res) {
                let chunks = [];
                res.on("data", chunk => {
                    chunks.push(chunk);
                });
                res.on("end", () => {
                    let body = Buffer.concat(chunks);
                    let jsonRes;
                    try {
                        jsonRes = JSON.parse(body.toString());
                        // console.log('返回结果===>' + JSON.stringify(jsonRes))
                    } catch (e) {
                        reject(e);
                    }
                    resolve(jsonRes);
                });

                res.on("error", e => {
                    // console.log("error", e);
                    reject(e);
                });
            });
            request.on("error", function(e) {
                reject(e);
            });
            let fileStream = fs.createReadStream(file);

            request.write(
                `--${self.boundary}\r\nContent-Disposition: form-data; name="bucket_name"\r\n\r\n${self.params.bucketName}\r\n--${
                    self.boundary
                }\r\nContent-Disposition: form-data; name="key"\r\n\r\n${dirname}\r\n--${
                    self.boundary
                }\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${mime}\r\n\r\n`
            );

            fileStream.pipe(
                request,
                { end: false }
            );

            fileStream.on("end", () => {
                // console.log("end", "--------------------------")
                request.end(`\r\n--${self.boundary}--`);
            });

            fileStream.on("error", e => {
                // console.log(e);

                reject(e);
            });
        });
    }

    getMime(extname) {
        let mime = {
            ".css": "text/css",
            ".png": "image/png",
            ".gif": "image/gif",
            ".js": "application/javascript",
            ".pdf": "application/pdf",
            ".jpg": "image/jpeg",
            ".svg": "image/svg+xml"
        };

        let res = "application/octet-stream";

        if (mime[extname]) {
            res = mime[extname];
        }

        return res;
    }
}

module.exports = Leonid;
