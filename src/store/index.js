import Vue from "vue";
import Vuex from "vuex";
import createLogger from 'vuex/dist/logger';
// import VuexSaga from "vuex-saga";

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== "production";

let store = new Vuex.Store({
    modules: {},
    strict: debug,
    plugins: debug ? [createLogger()] : []
});

export default store;
