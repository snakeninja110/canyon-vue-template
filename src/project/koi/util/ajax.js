// 这里引用了 一些基础的函数 从 杂项中 misc
import {forEach, loadJS, getUUID, getFullUrl, assign} from './misc'
// 这里是处理 URLSearchParams 的函数 可以参考nodejs 中的querystring的api
import {stringify as stringifyQS, parse as parseQS} from './querystring'
// 自定义事件，可以参考 nodejs 中的EventEmitter的api
import EventEmitter from './eventemitter'

// 主要用于 arguments 转数组
let slice = Array.prototype.slice
// 当前页面的域名， 带端口号
let host = window.location.host
// 是否原声支持 fetch
let hasFetch = !!window.fetch

/**
 * 绑定函数、this、固定参数 可以参考 Function.prototype.bind
 * @returns {Function}
 */
function bindFun() {
    var a = slice.call(arguments),
        m = a.shift(),
        o = a.shift()
    return function() {
        return m.apply(o == null ? this : o, a.concat(slice.call(arguments)))
    }
}

/**
 * 参数整合url, 将多个URLSearchParams字符串合并为一个
 * @param url
 * @param param
 * @returns {*}
 */
function fixedURL(url, param){
    let str = typeof param == 'string' ? param : stringifyQS(param,'&')
    if(str){
        return url + (url.indexOf("?") > -1 ? '&' : '?') + str
    }
    return url
}

// 参数转为 字符串
function getParamString(param, dataType){
    if(!param || typeof param == 'string'){
        return param || ''
    }
    if(dataType == 'json'){
        return JSON.stringify(param)
    }
    return stringifyQS(param)
}

function getDefaultContentType(dataType){
    if(dataType == 'json'){
        return 'application/json'
    }
    return 'application/x-www-form-urlencoded'
}

// 字符串格式化为 object，部分非标准的json字符串，只能用 eval来处理
// 如果为非标准的，实例化后，设置 isSafety 为false
function parseJSON(text, isSafety){
    try{
        return isSafety ? JSON.parse(text) : eval('(' + text + ')')
    }catch(e){}
    return null
}

// 结束 同意处理返回的数据
function responseEnd(req, res){
    if(!res.result && res.text){
        // 尝试格式为 json字符串
        res.result = parseJSON(res.text, this.isSafetyJSON !== false)
    }
    delete this._req
    // 出发验证事件
    this.emit("verify", res, req)
    if(res.cancel === true){
        // 验证事件中设置 res.cancel 为false，中断处理
        return ;
    }
    // callback事件，可以看做函数回调
    this.emit("callback", res, req)
    // 根据 res.err 来判断是否成功， 判断出发 success或者fail事件
    this.emit(res.err ? "fail" : "success", res, req)
}

// ============================Ajax=========================================
//创建XHR，兼容各个浏览器
let createXHR = window.XMLHttpRequest ? function(isCross){
    if(window.XDomainRequest && isCross){
        // IE8 创建跨域请求的xhr
        return new window.XDomainRequest()
    }
    return new window.XMLHttpRequest()
} : function(){
    // IE6 创建xhr
    return new window.ActiveXObject("Microsoft.XMLHTTP")
}

/**
 * progress 上传进度（type 为空）
 * progressdown 下载进度
 * @param type
 * @param event
 */
function onprogress(type, event){
    this.emit("progress" + type, event)
}

// xhr的onload事件
function onload(req, res){
    let xhr = req.xhr;
    // req.outFlag 为true 表示，本次ajax已经中止，无需处理
    if(xhr && !req.outFlag){
        let headers = ''
        try{
            // 获取所有可以的的header值（字符串）
            headers = xhr.getAllResponseHeaders()
        }catch(e){}
        
        // 获取某个headers中的值
        res.getHeader = function (key) {
            return new RegExp("(?:" + key + "):[ \t]*([^\r\n]*)\r").test(headers) ? RegExp["$1"] : "";
        }

        res.text = ""
        try{
            // 返回的文本信息
            res.text = xhr.responseText
        }catch(e){}
        // 默认状态值为 0
        res.status = 0
        try{
            // xhr status
            res.status = xhr.status
        }catch(e){}
        // if(res.status === 0){
        //     res.status = res.text ? 200 : 404;
        // }
        let s = res.status
        // 默认只有当 正确的status才是 null， 否则是错误
        res.err = (s >= 200 && s < 300 || s === 304 || s === 1223)? null : ('http error [' + s + ']')
        // 统一后处理
        responseEnd.call(this, req, res)
    }
    delete req.xhr
    delete req.outFlag
}

// 当xhr 无onload事件时使用
function onHttpRequestChange(req, res){
    let xhr = req.xhr
    if(xhr && xhr.readyState == 4){
        onload.call(this, req, res)
    }
}

/**
 * xhr 发送数据
 * @returns {Ajax}
 */
function httpSend(req, res) {
    // 是否为异步
    let async = req.async
    // 请求头
    let header = req.header
    // 发送参数格式
    let dataType = String(req.dataType || '').toLowerCase()

    // XHR
    req.xhr = createXHR(req.isCross)

    // xhr 是否使用了 IE6 XDR
    let isXDR = req.isXDR = req.xhr.constructor == window.XDomainRequest
    if(isXDR){
        // 注意 IE8 XDR无法同步
        async = req.async = true
    }

    // xhr 请求方法
    let method = String(req.method || 'GET').toUpperCase()

    if(req.withCredentials){
        // xhr 跨域带cookie
        req.xhr.withCredentials = true
    }

    let param = req.param
    if(method == 'GET'){
        // get 方法，参数都组合到 url上面
        req.xhr.open(method, fixedURL(req.url, param), async)
        param = null;
    }
    else{
        // 其他可以放 body上
        let url = req.url
        if(isXDR){
            // XDR 不能发送 body数据，参数只能放 url上
            url = fixedURL(url, param)
            param = null
        }
        req.xhr.open(method, url, async);
        if(header["Content-Type"] === undefined && !req.isFormData && !isXDR){
            // Content-Type 默认值
            header["Content-Type"] = getDefaultContentType(dataType)
        }
    }
    if(header['X-Requested-With'] === undefined && !req.isCross){
        // 跨域不增加 X-Requested-With 如果增加，容易出现问题，需要可以通过 事件设置
        header['X-Requested-With'] = 'XMLHttpRequest'
    }
    if(!isXDR){
        // XDR 不能设置 header
        forEach(header, function(v, k){
            req.xhr.setRequestHeader(k, v)
        })
    }
    res.status = 0
    if(this.hasEvent('progress')){
        // 跨域 加上 progress post请求导致 多发送一个 options 的请求
        // 只有有进度需求的任务,才加上
        try{
            req.xhr.upload.onprogress = bindFun(onprogress, this, "")
        }catch(e){}
    }
    if(this.hasEvent('progressdown')){
        // 下载进度 一般都不会使用
        try{
            req.xhr.onprogress = bindFun(onprogress, this, "down")
        }catch(e){}
    }

    //发送请求
    if(async){
        if(isXDR || 'onload' in req.xhr){
            // XDR 或者有onload时间走，onload事件
            req.xhr.onload = bindFun(onload, this, req, res);
        }
        else{
            // 根据状态判断
            req.xhr.onreadystatechange = bindFun(onHttpRequestChange, this, req, res)
        }
    }

    // 发送前出发send事件
    this.emit('send', req)
    // 发送请求，注意要替换
    req.xhr.send(getParamString(param, dataType).replace(/[\x00-\x08\x11-\x12\x14-\x20]/g, "*") || null) // eslint-disable-line
}

// ========================================================fetch请求数据================================
/**
 * fetch 发送数据
 */
function fetchSend(req, res) {
    // header
    let header = req.header
    // 方法
    let method = String(req.method || 'GET').toUpperCase()

    // url
    let url = req.url
    // 参数
    let param = req.param
    // 发送参数格式
    let dataType = String(req.dataType || '').toLowerCase()

    // fetch option参数
    let option = {
        method : method,
        headers: header
    }

    if(method == 'GET'){
        url = fixedURL(url, param)
        option.body = param = null
    }
    else{
        option.body = getParamString(param, dataType) || null
        if(header["Content-Type"] === undefined && !req.isFormData){
            // 默认 Content-Type
            header["Content-Type"] = getDefaultContentType(dataType)
        }
    }

    if(header['X-Requested-With'] === undefined && !req.isCross){
        // 跨域不增加 X-Requested-With
        header['X-Requested-With'] = 'XMLHttpRequest'
    }

    if(req.isCross){
        // 跨域
        option.mode = 'cors';
        if(req.withCredentials){
            // 发送请求，带上cookie
            option.credentials = 'include'
        }
    }
    else{
        // 同域，默认带上cookie
        option.credentials = 'same-origin'
    }

    // response.text then回调函数
    let fetchData = bindFun(function (text) {
        res.text = text || '';
        // 统一处理 返回数据
        responseEnd.call(this, req, res);
    }, this)

    // fetch then回调函数
    function fetchBack(response) {
        if(!req.outFlag){
            // outFlag 为true，表示 中止了

            // 获取header
            res.getHeader = function (key) {
                try{
                    return response.headers.get(key)
                }catch(e){
                    return ''
                }
            }
            
            // 状态吗
            res.status = response.status
            // 返回的字符串
            res.text = ''
            // 是否有错误
            res.err = response.ok ? null : 'http error [' + res.status + ']'
            // 获取 text
            let text
            try{
                text = response.text()
            }catch(e){}
            text ? text.then(fetchData, fetchData) : fetchData('')
        }
        delete req.outFlag
    }

    // 发送事件处理
    this.emit('send', req)
    // 发送数据
    window.fetch(url, option).then(fetchBack, fetchBack)
}

// ==============================================jsonp==============================================
function jsonpSend(req, res){
    // jsonp 无法获得header，所以全部返回 空
    res.getHeader = function() {
        return ''
    }
    // 参数
    let param = req.param
    // callback
    let key = req.jsonpKey || this.jsonpKey
    // jsonp回调字符串
    let backFunKey = param[key]
    if(!backFunKey){
        // 没设置，自动设置一个 
        param[key] = backFunKey = 'jsonp_' + getUUID()
    }

    // 控制，只出发一次回调
    let backFunFlag
    // 回调函数
    let backFun = bindFun(function(data){
        if(!backFunFlag){
            backFunFlag = true
            // json数据
            res.result = data
            // json字符串
            res.text = data ? JSON.stringify(data) : ''
            // 错误，有data就正确的
            res.err = data ? null : 'http error'
            if(!req.outFlag){
                // outFlag 就中止
                responseEnd.call(this, req, res)
            }
        }
    }, this)

    // 设置默认的回调函数
    window[backFunKey] = backFun

    // 所有参数都放在url上
    var url = fixedURL(req.url, param)

    // 发送事件出发
    this.emit('send', req)
    // 发送请求
    loadJS(url, function () {
        backFun();
    })
}

// 发送数据整理
function requestSend(xParam, req){
    if(req.outFlag){
        // 已经中止
        return
    }

    // 方法
    req.method = String(this.method || 'get').toUpperCase()
    // url
    req.url = this.url
    // 缓存，只针对get请求
    req.cache = this.cache
    // 请求类型
    req.dataType = String(this.dataType || '').toLowerCase()

    // callback中接收的 res
    let res = {
        // Ajax 实例
        root: this
    }

    // 异步？
    let async = req.async
    // 方法
    let method = req.method
    // 是否为 FormData
    let isFormData = false
    if(window.FormData && xParam instanceof window.FormData){
        isFormData = true
        if(method == 'GET' || method == 'JSONP'){
            method = req.method = 'POST'
        }
    }
    req.isFormData = isFormData

    if(isFormData){
        // FormData 将参数都添加到 FormData中
        forEach(this.param, function (value, key) {
            if(!xParam.has(key)){
                xParam.append(key, value);
            }
        })
        req.param = xParam
    }
    else{
        if(typeof xParam == "string"){
            // 参数为字符串，自动格式化为 object，后面合并后在序列化
            xParam = parseQS(xParam) || {};
        }
        req.param = assign({}, this.param, xParam)
    }

    // 合并 默认的get参数
    req.qsParam = assign({}, this.qsParam)
    // 合并默认的header
    req.header = assign({}, this.header)

    // 出发open事件
    this.emit('open', req)

    // 还原,防止复写， 防止在 open中重写这些参数
    req.isFormData = isFormData;
    req.async = async;
    req.method = method;

    if(method == 'GET'){
        if(req.cache === false && !req.qsParam._r_){
            // 加随机数，去缓存
            req.qsParam._r_ = getUUID()
        }
        // qsParam 复制到 param
        req.param = assign({}, req.qsParam, req.param)
    }
    else if(method == 'JSONP'){
        // qsParam 复制到 param
        req.param = assign({}, req.qsParam, req.param)
    }
    else{
        // qsParam 复制到 URL上
        req.url = fixedURL(req.url, req.qsParam)
    }

    // 是否跨域, 获全路径后，比对
    req.isCross = !/:\/\/$/.test(getFullUrl(req.url).split(host)[0] || '')

    if(method == 'JSONP'){
        // jsonp 获取数据
        jsonpSend.call(this, req, res)
        return
    }

    if(hasFetch && async && this.useFetch && !this.hasEvent('progress')){
        //fetch 存在 fetch 并且无上传或者进度回调 只能异步
        fetchSend.call(this, req, res)
        return
    }

    // 走 XMLHttpRequest
    httpSend.call(this, req, res)
}

/**
 * Ajax基础类
 * @param url
 * @param method
 * @param async
 */
export default class Ajax extends EventEmitter {

    // 初始化
    constructor (url, method, async, type) {
        super()

        if(typeof async == 'string'){
            type = async;
            async = true;
        }

        // url  ==> req
        this.url = url
        // 方法 ==> req
        this.method = String(method || 'GET').toUpperCase()
        // 异步？ ==> req
        this.async = this.method == 'JSONP'? true : (async === false ? false : true)
        // 参数  ==> req
        this.param = {}
        // url上参数 ==> req
        this.qsParam = {}
        // 请求头设置 ==> req
        this.header = {}
        // 缓存 get ==> req
        if(type){
            // 请求 非 get 请求时 数据格式化类型 FormData 除外
            this.dataType = type
        }
    }

    // 中止 请求
    abort () {
        let req = this._req
        if(req){
            // 设置outFlag，会中止回调函数的回调
            req.outFlag = true
            if(req.xhr){
                // xhr 可以原声支持 中止
                req.xhr.abort()
                req.xhr = null
            }
            delete this._req
        }
        return this;
    }

    // 超时
    timeout (time, callback) {
        setTimeout(() => {
            let req = this._req
            if(req){
                // 超时 设置中止
                this.abort()
                // 出发超时事件
                this.emit('timeout', req)
            }
        }, time)
        callback && this.on('timeout', callback)
        return this
    }

    // 发送数据， over 代表 是否要覆盖本次请求
    send (param, over) {
        if(this._req){
            // 存在 _req
            if(!over){
                // 不覆盖，取消本次发送
                return this
            }
            // 中止当前的
            this.abort()
        }

        // 制造 req
        let req = this._req = {
            root: this,
            async: this.async
        }

        if(this.async){
            // 异步，settime 部分参数可以后置设置生效
            setTimeout(bindFun(requestSend, this, param || {}, req), 1)
        }
        else{
            // 同步，直接发送
            requestSend.call(this, param || {}, req)
        }
        return this
    }
}

// 使用 fetch
Ajax.prototype.useFetch = true
// 默认的 jsonp 的 callbackkey
Ajax.prototype.jsonpKey = 'callback'

// 用于生成快捷方法
function shortcut(type){
    return Ajax[type] = function(url, callback, param, sync, dataType){
        if(typeof sync == 'string'){
            dataType = sync;
            sync = false;
        }
        let t = new Ajax(url, type, !sync, dataType)
        callback && t.on('callback', callback);
        t.send(param);
        return t;
    }
}

// 三个快捷方法
export let get = shortcut('get')
export let post = shortcut('post')
export let put = shortcut('put')

// jsonp方法
export function jsonp(url, callback, param, key){
    let t = new Ajax(url, 'jsonp', true)
    key && (t.jsonpKey = key)
    callback && t.on('callback', callback)
    t.send(param)
    return t
}
Ajax.jsonp = jsonp

// fetch方法 只有 支持 window.promise 才能使用
export function fetch(url, opt){
    opt || (opt = {});
    return window.Promise(function(resolve, reject){
        new Ajax(url, opt.method, true).assign({header:opt.headers}).on('callback', function(res){
            (res.err? reject : resolve)(res);
        }).send(opt.body)
    })
}
Ajax.fetch = fetch