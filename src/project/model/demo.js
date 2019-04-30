// import {
//   format as formatDate
// } from "koi/util/date";

export default function(ajax) {
    // env, model
    let demo = {};

    demo.login = (params, callback) => {
        ajax.post(
            "webapi:login/login",
            res => {
                callback && callback(res);
            },
            params
        );
    };

    demo.search = (params, callback) => {
        ajax.get(
            "webapi:search/searchList",
            res => {
                callback && callback(res);
            },
            params
        );
    };

    return demo;
}
