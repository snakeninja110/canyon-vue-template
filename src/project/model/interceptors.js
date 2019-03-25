/* 
 * 2018-09-26 [-]去除风控
 */
// QS
import * as QS from "koi/util/querystring";
// import { getFullUrl } from "koi/util/misc";
import {
    oc
} from "koi/util/optionalchaining";

// 参数的简单扩展
function extra(...arg) {
    if (arg.length < 2) {
        return;
    }
    let opt = arg.shift();
    while (arg.length) {
        let x = arg.shift();
        if (typeof x == "string") {
            x = QS.parse(x);
        }
        for (let n in x) {
            if (x.hasOwnProperty(n)) {
                opt[n] = x[n];
            }
        }
    }
}


// 请求拦截器中支持 简短路径配置
// local:/api/share/ajax/cors   => //127.0.0.1:3001/api/share/ajax/cors
const urlPathsReg = /^(\w+):\/*/;
let urlPaths = {};
export function setURLPaths(key, value) {
    urlPaths[key] = value;
}
let resDefErrMsg = "连接超时，请稍后再试...";

function getOC(key, def) {
    return oc(this.data, key, def);
}

let serverTimeDiff = 0;
export function getServerDate() {
    // 通过时间戳，计算服务器时间 并返回
    // 需要正确获得时间戳，必须经过一次ajax的请求
    return new Date(serverTimeDiff + new Date().getTime());
}

export function interceptors(ajax, env) {
    let ajaxFn = ajax.prototype;

    urlPaths.webapi = env.isDev ? "/ordercollect/trainapi/" : env.isTest ? "/wxuniontraintest/trainapi/" : "/uniontrain/trainapi/";

    // 拦截器
    ajaxFn.on("open", function (req) {
        req.url = req.url.replace(urlPathsReg, function (s0, s1) {
            return urlPaths[s1] || s0;
        });

        if (this.stopPara) {
            // 停止...
            return;
        }

        // 时间挫
        let timeDiff = new Date().getTime();

        // post 支持FormData参数
        let isFormData = req.isFormData;
        let para = {
            TimeStamp: timeDiff / 1000
        };

        para.memberId = env.userId || undefined;
        para.requestAccount = env.requestAccount || undefined;
        para.openId = env.openId || undefined;
        para.unionId = env.unionId || undefined;
        para.platId = env.platId || '501';

        let param;
        if (isFormData) {
            // FormData 单独append 加入 para _
            this.emit("para", para, req);
            param = req.param;
            for (let n in para) {
                if (!param.has(n)) {
                    param.append(n, para[n]);
                }
            }
        } else {
            // 整合参数
            extra(para, req.param || {});
            this.emit("para", para, req);
            req.param = {
                para: JSON.stringify(para)
            };
        }

        // 以便后面可以使用
        req.para = para;
    });

    ajaxFn.on("verify", function (res) {
        // 获取 res.data中子数据
        res.getData = getOC;

        if (res.status === 0) {
            // 中途 失踪了 -_- 怪我咯
            res.cancel = true;
            return;
        }
        //console.log('interceptors res', res);
        let result = res.result || {};
        if (!this.stopPara) {
            res.data = result.data;

            // let code = (res.dataCode = result.status);
            let msg = (res.dataMsg = result.error);
            let tag = (res.dataTag = result.respTag);
            if (tag) {
                env.lastTag = tag;
            }

            // 别名 获取服务器时间
            let time = result.respTime;
            if (time) {
                // 设置本地时间与后台时间的时间戳
                serverTimeDiff = new Date(time.replace(/-/g, "/")).getTime() - new Date().getTime();
            } else {
                // 服务器时间尝试到 header中取得
                let dateStr = res.getHeader("Date");
                if (dateStr) {
                    serverTimeDiff = new Date(dateStr).getTime() - new Date().getTime();
                }
            }

            res.err = null;
            if (res.error) {
                // 异常数据
                res.err = msg || resDefErrMsg;
            }
        }
    });

    // 不使用fetch
    // 混合禁用fetch，目前已知MotoX2代报错
    if (env.isHybrid) {
        ajax.prototype.useFetch = false;
    }
}

export default interceptors;