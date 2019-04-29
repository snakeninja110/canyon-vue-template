/* 
 * 2019-03-22 
 */

// cookie
import * as cookie from "./koi/util/cookie";

function getQuery(str, key) {
    return new RegExp("[&? ]" + key + "=([^&]*)&?", "i" || undefined).test("&" + str) ? RegExp.$1 : "";
}

// 获取cookie中的信息
function getCookParam(key) {
    return getQuery(cookie.getItem("(?:OcUser|AppUser|SqUser|WxUser|cnUser|cnUserElong)") || "", key);
}

// refid
// search 中的  hash中路由的参数  cookie中的参数 都不区分大小写 refid
//let refId = decodeURIComponent(getQuery(window.location.search, 'refid', 'i') || getQuery(window.location.hash.split('?')[1] || '', 'refid', 'i') || '') || cookie.getItem('17uCNRefId')

let isDev = process.env.NODE_ENV == "development";

let isTest = window.location.search == "?test";


let env = {
    // 开发版本
    isDev,
    // 测试路径
    isTest,
    protocol: window.location.protocol.indexOf("http") == 0 ? "" : "https:"
};

// 用户 platId
Object.defineProperty(env, "platId", {
    set() {},
    get() {
        return getCookParam("platid");
    }
});

// requestAccount
Object.defineProperty(env, "requestAccount", {
    set() {},
    get() {
        return getCookParam("requestaccount");
    }
});

// 用户 memberid
Object.defineProperty(env, "userId", {
    set() {},
    get() {
        return getCookParam("userid");
    }
});

// token
Object.defineProperty(env, "token", {
    set() {},
    get() {
        return getCookParam("token");
    }
});

// token
Object.defineProperty(env, "keyId", {
    set() {},
    get() {
        return getCookParam("userid") || getCookParam("openid") || getCookParam("unionId") || "";
    }
});

env.setOCUser = function (userId, platId, requestAccount) {
    let val = [];
    if (userId) {
        val.push("userid=" + userId);
    }
    if (platId) {
        val.push("platid=" + platId);
    }
    if (requestAccount) {
        val.push("requestaccount=" + requestAccount);
    }
    cookie.setItem("OcUser", val.join("&"), undefined , "/");
}

// 目前只有微信
export default env;