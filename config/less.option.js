//modify-var  global-var
// less 头部，less定义同名，会被覆盖
let globalVar = {};

let isDev = process.env.NODE_ENV === "development";

// 运行环境  非dev 走cdn 本地 定位到 funs.less 为相对目录
let iconSpritePath = '"..\\\\sprite\\\\';

// 基础，通用的变量配置
globalVar.base = {
    env: isDev ? "dev" : "pro",
    "sprite-icon": iconSpritePath + 'icon_base.png"',
    // 顶部导航bar的高度
    "navbar-height": "0",
    // iphonex 底部高度
    "iphonex-bottom-height": "34px",

    // ========================================= 字体颜色 ===
    "font-primary": "#606266", // 用户标题正文
    "font-secondary": "rgba(0,0,0,.4)",
    "font-hint": "#A2A2A2", // 用户说明文字
    "font-disable": "#e9e9e9", // 用户输入框默认提示
    "font-check": "#cecece",

    "font-first": "#0dd66c", // 颜色主色
    "font-second": "#ff613c", // 颜色次色
    "font-link": "#6c8bbf", // 用于链接
    "font-null": "#c0c5d0", // 用于无结果
    "font-placeholder": "#d0d5d0", // placeholder提示颜色
    "font-warning": "#f76a23", // 用户公告栏文案

    // ======================================= 背景颜色 =========
    "bg-first": "#edf0f5", // 主要背景，大背景
    "bg-second": "#FAFAFA", // 次要的，card展开后的背景色
    "bg-line": "#f4f4f4", // 用户页面中线的颜色

    "bg-warning": "#fefced", // 提示条背景

    "bg-btn-first": "#0dd66c", // 按钮背景
    "bg-btn-first-click": "#2bae57", // 按钮背景按压
    "bg-btn-first-border": "transparent",
    "bg-btn-ex": "#ff613c", // 按钮背景
    "bg-btn-ex-click": "#ef5530", // 按钮背景按压

    "bg-btn-second": "#fff", // 按钮背景
    "bg-btn-second-click": "#eee", // 按钮背景按压
    "bg-btn-second-border": "transparent",

    "bg-btn-third": "#fff", // 按钮背景
    "bg-btn-third-click": "#eee", // 按钮背景按压
    "bg-btn-third-border": "#cecece",

    "bg-btn-disable": "#ddd", // 置灰按钮

    // ===================================== ipt 颜色 ========
    "ipt-border": "#CCCCCC",
    "ipt-disable": "#CCCCCC",

    // ======================================= 透明度 =========
    "opacity-40": ".4", // 按钮未唤起状态 透明度未40%

    // ======================================= 圆角弧度 ==========
    "border-radius-size": "2px", // 边框弧度
    "border-radius-size-large": "10px",

    // 渐变按钮背景
    "btn-trans-start": "#0ac8b4",
    "btn-trans-end": "#0fd78c",
    "btn-trans-shadow": "rgba(13, 209, 160, 0.3)",

    "border-color": "#babcc1"
};

// 微信私有变量
globalVar.weixin = {};


//出行
globalVar.tcgo = {};

// 样式渠道
let forStyle = {

};

// 到处，私有合基础混合
module.exports = function(channel) {
    let val = globalVar[channel] || {};
    val.channel = channel;
    // 样式主要分三种， （touch hybrid => tc）（weixin elong => wx）（shouq => qq）
    val.style = forStyle[channel] || "tc";
    let exp = {
        globalVars: Object.assign({}, globalVar.base, val)
    };
    return exp;
};
