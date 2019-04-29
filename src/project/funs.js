// document
// let doc = window.document;

export default function install(vue) {
    // 原型链
    let vFn = vue.prototype;

    // ========== 插件资源 整体做监控 ===============
    let plugRes = {
        // 键盘显示
        // isKeyboardShow: false,
        // 浏览器前进后退 为true的时间为 800ms
        isPopstate: false
    };
    vFn.$plugRes = plugRes;

    // 浏览器前进后退监控
    let popstateHld;
    window.addEventListener(
        "popstate",
        function () {
            plugRes.isPopstate = true;
            clearTimeout(popstateHld);
            popstateHld = setTimeout(function () {
                plugRes.isPopstate = false;
            }, 800);
        },
        false
    );

    // 获取唤醒的 name
    // let visState = function () {
    //     let prefixes = ["webkit", "moz", "ms", "o"];
    //     if ("visibilityState" in doc) {
    //         return "visibilityState"
    //     }
    //     for (let i = 0; i < prefixes.length; i += 1) {
    //         if ((prefixes[i] + "VisibilityState") in doc) {
    //             return prefixes[i] + "VisibilityState";
    //         }
    //     }

    //     return ""
    // }();
    // let evtName = visState.replace(/[Vv]isibilityState/, "visibilitychange");
    // // 增加唤醒 事件
    // if(evtName && visState) {
    //     doc.addEventListener(evtName, function() {
    //         if(doc[visState] == "visible") {
    //             vFn.$unicom("plug_page_visable");
    //         }
    //     }, false);
    // }
}