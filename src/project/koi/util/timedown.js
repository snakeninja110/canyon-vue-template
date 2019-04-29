import * as date from './date';
import Eventemitter from './eventemitter';

let queue = [];
let interval;

/**
 * 返回时差字符串形式
 * @param {*} time 
 */
let getDiff = function(time){
    var s = time % 60;
    var m = Math.floor(time / 60) % 60;
    var h = Math.floor(time / 60 / 60) % 24;
    var d = Math.floor(time / 60 / 60 / 24);
    var rv = [];
    d > 0 && rv.push(d + '天');
    (d > 0 || h > 0) && rv.push(('0' + h).slice(-2) + '时');
    (d > 0 || h > 0 || m > 0) && rv.push(('0' + m).slice(-2) + '分');
    (d > 0 || h > 0 || m > 0 || s > 0) && rv.push(('0' + s).slice(-2) + '秒');
    return rv.join('');
}

/**
 * 获取当前时间，可以更改为获取当前服务器时间
 */
let getNow = function(){
    return date.create();
}

/**
 * 执行一次 一个 循环
 * @param {*} x 
 */
function one(x){
    let spt = Math.floor((x.endTime - (x.getNow || getNow)().getTime()) / 1000);
    if(x.prev != spt){
        // 本次时差与上一次有差异，就执行回调
        // 当spt <= 0 为最后一次回调
        let diff = (x.getDiff || getDiff)(spt);
        x.emit('change', diff, spt);
        x.prev = spt;
        if(spt <= 0){
            x.emit('end', diff, spt);
        }
    }
    return spt > 0;
}

function step(){
    if(queue.length){
        for(let i = 0; i < queue.length;){
            if(one(queue[i])){
                // 下一个
                i += 1;
            }
            else{
                // 移除
                queue.splice(i, 1);
            }
        }
    }
    else{
        // 无队列，移除 interval
        clearInterval(interval);
        interval = null;
    }
}

/**
 * 倒计时 函数
 * @param {Number|String|Date} time 为数字时，代表，需要执行多少秒的倒计时 
 * @return {eventemitter} 自定义事件对象
 * @event change 事件，剩余时间 改变时触发，两个参数 第一个 diff 字符串 第二个diff（秒）
 * @event end 倒计时结束时候调用
 */
function timeDown(time){
    if(typeof time == 'number'){
        time = date.create().getTime() + (time * 1000);
    }
    var x = new Eventemitter();
    x.endTime = date.create(time).getTime();
    queue.push(x);
    if(!interval){
        interval = setInterval(step, 250);
    }
    return x;
}

/**
 * 设置默认的 获取当前时间的函数
 * @param {Function} fn 
 */
timeDown.setGetNowFun = function(fn){
    getNow = fn;
    return timeDown;
}
/**
 * 设置默认的格式化 时间函数
 * @param {Function} fn 
 */
timeDown.setGetDiff = function(fn){
    getDiff = fn;
}

export default timeDown;