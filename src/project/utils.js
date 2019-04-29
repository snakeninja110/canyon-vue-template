/**
 * 判断对象是否为空对象
 * [] {} false 0 "" null undefined
 */
export function isEmpty(val) {
    if (val && typeof val == "object") {
        if (val.length && val.length > 0) {
            return false;
        }

        for (let key in val) {
            if (window.hasOwnProperty.call(val, key)) {
                return false;
            }
        }
        return true;
    }
    return !val;
}

/**
 * 返回数据类型
 * Array, Object, String, Number
 */
export function isTypeOf(o) {
    return Object.prototype.toString.call(o).slice(8, -1);
}

/**
 * 解决浮点运算精度
 * @param {*} num 数字
 * @param {*} precision 处理精度(默认12，不用改)
 */
export function strip(num, precision = 12) {
    return +parseFloat(num.toPrecision(precision));
}

/**
 * 自动补位
 * @param {*} str 原始值
 * @param {*} len 补位的长度
 * @param {*} ch 补的值（默认为空格）
 * leftPad("foo",5); //" foo";
 * leftPad("foo",5,0); //"00foo"
 */
export function leftpad (str, len, ch) {
    str = String(str);
    var i = -1;
    if (!ch && ch !== 0) ch = ' ';
    len = len - str.length;
    while (++i < len) {
        str = ch + str;
    }
    return str;
}
