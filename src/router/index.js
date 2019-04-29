import VueRouter from "vue-router";

// import abtester from "@/project/abtester";

let api = window.hcpApi || {};

function hasClass(dom, className) {
    let name = " " + dom.className + " ";
    return name.indexOf(" " + className + " ") > -1;
}

function appendClass(dom, className) {
    if (!hasClass(dom, className)) {
        dom.className = dom.className.trim() + " " + className;
    }
}

// 自定义属性
// placeHide 切换自路由是 隐藏 isShowBg 的节点
// navbarOption 设置默认的title 实际vue中可以改变  hybrid中，支持object设置其他功能

let routes = [
    {
        path: '/',
        redirect: '/login',
        // hidden: true
    },
    {
        path: '/login',
        name: '登录',
        meta: {
            clear: true
        },
        component: resolve => require(["@/views/login/login"], resolve)
    },
    {
        path: '/index',
        name: '车次查询',
        meta: {
            menu: 'book',
            keepAlive: true
        },
        component: resolve => require(["@/views/index/index"], resolve)
    }
];

export let router = new VueRouter({
    routes
});

window.$router = router; // 全局设置

// 生成 id
function makeIds(rs, rv = {}, childer = 0, parent = null) {
    rs.forEach(function (item) {
        // 生成 默认的 unicom-id
        // 方便$unicom 发送消息可以指定路由
        if (!item.props) {
            item.props = {}
        }
        if (!item.props["unicom-id"]) {
            item.props["unicom-id"] = "route-" + item.name;
        }
        rv[item.path] = item;
        item.childer = childer;
        item.parent = parent;
        if (item.children) {
            makeIds(item.children, rv, 1, item);
        }
    });
    return rv;
}

// 通过路径获取 route配置
let getRouteDate = function () {
    let data = makeIds(routes);
    return function (path) {
        if (!data[path]) {
            // 正则匹配就会启用这个 比如 /xxx/:id
            let r = router.matcher.match(path);
            let rs = r.matched;
            for (let i = rs.length - 1; i >= 0; i -= 1) {
                if (rs[i].name == r.name) {
                    path = rs[i].path;
                }
            }
        }
        return data[path];
    }
}()

function getRoot(item) {
    while (item.parent) {
        item = item.parent;
    }
    return item;
}


// 检测 x1 是否包含于 x2
function isIn(x1, x2) {
    while (x1.parent) {
        x1 = x1.parent;
        if (x1 == x2) {
            return true;
        }
    }
    return false;
}

// 全局 自路由显示，是否需要隐藏相应节点
let placeScroll = {};
let placeScrollHandle;

// 增加 route para 传参
let routePara = {};
let routerResolve = router.resolve;
router.resolve = function (loc) {
    let x = routerResolve.apply(this, arguments);
    if (loc.para) {
        x.location.para = loc.para;
    }
    return x;
};

let transitionTo = router.history.transitionTo;
router.history.transitionTo = function (loc) {
    // {para, path, query}
    //console.log('arguments[0]', arguments[0])
    let to = typeof loc == "string" ? {
        path: loc
    } : loc;
    if (to.para != null) {
        routePara[to.path] = to.para;
    }

    let toRoute = getRouteDate(to.path);
    if (toRoute) {
        let root = getRoot(toRoute);
        if (root != toRoute && root._query) {
            if (!to.query) {
                to.query = {};
            }
            //Object.assign(to.query, root._query)
            to.query["-"] = JSON.stringify(root._query);
            arguments[0] = to;
        }
    }
    transitionTo.apply(this, arguments);
};

// 获取带入的 para 参数
router.getPara = function (path) {
    return routePara[path || this.history.current.path] || null;
};

// 获取根路由参数
router.getRootQuery = function () {
    let path = this.history.current.path;
    let route = getRouteDate(path);
    if (!route) {
        return {};
    }
    return getRoot(route)._query || {};
};

// 页面边缘滑动，触发前进后退 不使用动画 ================================================================
//  visibility: hidden!important;
// import debug from 'koi/util/debug'
let dyCSS;
let dyCSSNoTransition = `
    .router-root{opacity:1!important; transform:none!important; -webkit-transform:none!important; transition: no!important; -webkit-transition: no!important;}
    .router-child{opacity:1!important; transform:none!important; -webkit-transform:none!important; transition: no!important; -webkit-transition: no!important;}
`;

function setDyCSS(str) {
    if (!dyCSS) {
        dyCSS = document.createElement("style");
        dyCSS.type = "text/css";
        (document.head || document.getElementsByTagName("head")[0]).appendChild(dyCSS);
    }
    dyCSS.innerHTML = str || "";
}

// function getEventX(ev) {
//     //移动是多点触控，默认使用第一个作为clientX和clientY
//     if (ev.clientX == null) {
//         let touches = ev.targetTouches && ev.targetTouches[0] ? ev.targetTouches : ev.changedTouches;
//         if (touches && touches[0]) {
//             ev.clientX = touches[0].clientX;
//             return touches[0].clientX;
//         }
//     }
//     return ev.clientX;
// }

let dyNoTransitionFlag = 0,
    dyStartX = 0,
    dyPeripher = window.innerWidth * 0.1,
    dyLastEl,
    dyPath;

// function clearNoTransition() {
//     if (dyNoTransitionFlag > 0) {
//         dyNoTransitionFlag = 0;
//         setDyCSS("");
//     }
// }

window.addEventListener("hashchange", function () {
    // debug(dyNoTransitionFlag)
    if (dyNoTransitionFlag < 2) {
        return;
    }
    // 设置为 动画
    setDyCSS(dyCSSNoTransition);
    let path = window.location.hash.split("?")[0];
    if (dyStartX < dyPeripher) {
        // 后退
        if (path != dyPath && dyLastEl) {
            // 隐藏最顶部的 界面
            dyLastEl.style.visibility = "hidden";
        }
    }
    dyPath = null;
    dyLastEl = null;
    // dyNoTransitionHandle = setTimeout(clearNoTransition, 700);
});

// ....
// eslint-disable-next-line
export function vueRouterInstall(Vue, env) {

    // 注册
    Vue.use(VueRouter);

    let plugRes = Vue.prototype.$plugRes;

    // 代码后退 为true的时间为 800ms
    plugRes.isRouteBack = false;
    let routerBack = router.back;
    let routeBackHld;
    router.back = function () {
        plugRes.isRouteBack = true;
        clearTimeout(routeBackHld);
        routeBackHld = setTimeout(function () {
            plugRes.isRouteBack = false;
        }, 800);
        return routerBack.apply(router, arguments);
    };

    Vue.mixin({
        data() {
            return {
                isShowBg: true,
                routePath: ""
            };
        },
        computed: {
            appRoot() {
                // App.vue VM引用
                return window.hcpApi.appRoot;
            }
        },
        watch: {
            navbarOption() {
                // console.log('watch')
            }
        },
        // 路由嵌套越深，会多次触发
        beforeRouteUpdate(to, from, next) {
            let xTo = getRouteDate(to.path);
            let xFrom = getRouteDate(from.path);

            if (isIn(xFrom, xTo)) {
                // 子路由，返回到父路由
                if (this.routePath == to.path) {
                    this.isShowBg = true;
                }
            } else if (isIn(xTo, xFrom)) {
                // 跳转到子路由
                if (xTo.placeHide) {
                    this.isShowBg = false;
                }
            }

            next();
        },
        beforeRouteLeave(to, from, next) {
            // 回退的时候，动画更顺畅
            let top = document.body.scrollTop || document.documentElement.scrollTop;
            let toY = placeScroll[this.$parent.routePath] - top;
            let el = this.$el;
            if (hasClass(el, "router-child") && toY) {
                setTimeout(function () {
                    appendClass(el, "anim-fixed");
                }, 10);
            }

            // 销毁参数, 当一级路由 离开的时候，删除所有一级路由一下的 参数
            // 不销毁了，销毁造成前进后退问题
            // let cur = getRouteDate(this.routePath) || {};
            // if (!cur.parent) {
            //     // 销毁所有
            //     for (let n in routePara) {
            //         if (n.indexOf(this.routePath) == 0) {
            //             delete routePara[n];
            //         }
            //     }
            // }

            next();
        },
        created() {
            if (!this.routePath && this.$route) {
                this.routePath = this.$route.path;
            }
        }
    });


    // replace 在 苹果 无痕模式有点问题， 这里是 返回后，在跳转
    let backNum = 0,
        backPara,
        backNext;

    window.addEventListener("pagehide", function () {
        if (backNext) {
            backNext();
        }
        backNext = null;
    });

    function backGoNext(next) {
        if (backNum < 0) {
            if (/MZBrowser\/[0-7]/.test(window.navigator.userAgent)) {
                // 每次 back go 手机异常, 这个是魅族浏览器有异常的
                // 比7 高的版本是否会这样不知道，暂时到7版本的吧
                backNum = 0;
            } else {
                // 检测当前路由是否是 一级路由 current pending
                // 无法使用 router.histroy.curr...， path 在不分手机值不改变
                let path = window.location.hash.replace(/^#/, "").split("?")[0];
                let cur = getRouteDate(path) || {};
                if (!cur.parent) {
                    backNum = 0;
                }
            }

            //backNum = 0
        }
        if (backNum == 0) {
            let para = backPara;
            backPara = null;
            if (typeof para == "string") {
                window.location.href = para;
                if (next) {
                    backNext = next;
                }
            } else if (typeof para == "function") {
                para(next);
            } else if (para) {
                router.push(para);
            } else {
                next();
            }

            return;
        }
        window.history.back();
        //router.back()
    }

    // 交互页面，跳转时调用，页面跳转出时，需要做些逻辑处理
    api.backGo = function (para, num) {
        if (typeof para == "string" && /^tctclient:\/\//.test(para)) {
            window.location.href = para;
            return;
        }
        if (backNum != 0) {
            // 防止多次重复调用
            return;
        }

        if (num == null) {
            num = -1;
        }

        backNum = num;
        backPara = para;
        backGoNext();
    };

    router.backGo = function (para, num) {
        api.backGo(typeof para == "string" ? {
            path: para
        } : para, num);
    };

    router.beforeEach((to, from, next) => {
        if (backNum) {
            backNum -= 1;
            backGoNext(next);
            return;
        }

        // 首次进入，如果有特殊参数，读取后销毁
        if (from.matched.length == 0) {
            let query = to.query;
            let openId = query.openId || "";
            let requestAccount = query.requestAccount || "";
            let memberId = query.memberId || "";
            let unionId = query.unionId || "";
            let platId = query.platId || "";
            if ((openId || unionId) && requestAccount && memberId) {
                delete query.openId;
                delete query.requestAccount;
                delete query.memberId;
                delete query.unionId;
                delete query.platId;
                env.setOCUser(memberId, platId, requestAccount, openId, unionId);
                next({
                    path: to.path,
                    query: query,
                    replace: true
                })
                return;
            }
        }

        let toPath = to.path;
        let toRoute = getRouteDate(toPath);

        function go() {
            placeScroll[from.path] = !fromRoute || isIn(fromRoute, toRoute) ? 0 : document.body.scrollTop || document.documentElement.scrollTop;
            setTimeout(function () {
                // 为了 侧滑更顺畅
                next();
            }, 10);
        }

        if (!toRoute) {
            // 非路由表中路由，直接跳转到首页
            next({
                path: "/index",
                replace: true
            });
            return;
        }

        // 第一层路由
        let root = getRoot(toRoute);

        if (root == toRoute) {
            root._query = to.query;
        }
        let fromRoute = getRouteDate(from.path);
        let fRoot = fromRoute ? getRoot(fromRoute) : null;
        if (toRoute.parent) {
            // 第一次进入 name 为空，不能进入 子路由，直接切换到根路由  , 返回到 其他的自路由
            let param = to.query["-"];
            let rto = {
                path: root.path,
                replace: true
            };
            if (param) {
                rto.query = JSON.parse(param);
            }
            //rto.query = to.query
            // console.log(rto)
            if (!from.name) {
                next(rto);
                return;
            }

            if (fRoot != root) {
                //next(false)
                setTimeout(function () {
                    router.back();
                }, 0);
                return;
            }
        }

        go();
    });

    router.afterEach((to, from) => {
        let toRoute = getRouteDate(to.path);
        let fromRoute = getRouteDate(from.path);
        if (toRoute && fromRoute) {
            // 路由 滚动条切换
            if (isIn(fromRoute, toRoute)) {
                // 子路由回到父，呈现
                clearTimeout(placeScrollHandle);
                placeScrollHandle = setTimeout(() => {
                    let toY = placeScroll[to.path] || 0;
                    let sY = document.body.scrollTop || document.documentElement.scrollTop || 0;
                    if (toY != sY) {
                        window.scrollTo(0, toY);
                    }
                }, 10);
            } else {
                if (!isIn(toRoute, fromRoute)) {
                    // 无关联的，滚动条到头部
                    window.scrollTo(0, 0);
                }
            }
        }
    });
}