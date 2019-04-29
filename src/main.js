// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css'; // since we use DLL.
import App from "./App";

Vue.use(ElementUI);

// 环境
import env from "@/project/env";

// vuex
import store from "./store";

// 需要放在router之前，这样在router中可以设置unicomId参数，就有有效
import Unicom from "vue-unicom";
Vue.use(Unicom);

// ajax 插件 + 项目拦截器  拦截器内容需要项目自己添加和修改
// 统一的存储
import model from "@/project/model";
Vue.use(model, {
    store
});

// 公共函数库
import Funs from "@/project/funs";
Vue.use(Funs);

import { router, vueRouterInstall } from "./router";
Vue.use(vueRouterInstall, env);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: "#app",
    router,
    components: { App },
    template: "<App/>"
});
