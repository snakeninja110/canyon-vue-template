// ajax库
import _ajax from "koi/util/ajax";

// 拦截器
import {interceptors, setURLPaths, getServerDate} from "./model/interceptors";

// 收单
import _collect from "./model/collect";

// 本地存储模块
import _local from "./local";

// 用户信息
import _env from "./env";

// 用户信息
export let env = _env;

// 导出
export let ajax = _ajax;

let modelFn = {};

// interceptors 拦截器 服务器时间 是否在夜间
interceptors(ajax, env, modelFn);


// 收单模块
export let collect = _collect(ajax, env, modelFn, setURLPaths);

// 本地存储
export let local = _local(ajax, env, modelFn);

// =================
Object.assign(modelFn, {
    env,
    getServerDate,
    collect
});

// 是否安装过
let isInstalled = false;
let inVM = null;
let inStore = null;

// 调用的 vm
Object.defineProperty(modelFn, "vm", {
    get() {
        return inVM || window.hcpApi.appRoot;
    }
});

// vuex的数据
Object.defineProperty(modelFn, "store", {
    get() {
        return inStore;
    }
});

function _install(vue, { ajaxName = "ajax", modelName = "model", localName = "local", store } = {}) {
    if (isInstalled) {
        return;
    }
    inStore = store;
    isInstalled = true;
    vue.prototype["$" + ajaxName] = _ajax;
    Object.defineProperty(vue.prototype, "$" + modelName, {
        get() {
            inVM = this && this != vue.prototype ? this : window.hcpApi.appRoot;
            return modelFn;
        }
    });
    vue.prototype["$" + localName] = local;
}

export let install = _install;
export default install;