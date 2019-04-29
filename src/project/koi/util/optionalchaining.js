/**
 *
 * User: 管小龙
 * Date: 2018/7/4
 * Time: 16:54
 *
 */
/**
 *
 * @param props 对象 [] {}
 * @param property 值
 * @param def 找不到的返回值
 * @returns {*}
 */
//demo
/*
var obj = {
abc: {
    def: [{
        ghi: '123'
    }]
}
}
let str = oc(obj, 'abc.def.0.ghi') // 输出 '123'
*/
export function oc(props, property, def) {
    if (!property || typeof property !== 'string') return props
    const arrProperty = property.split('.')
    const $return = arrProperty.reduce((prev, curr) => {
        return prev && prev[curr]
    }, props)
    return $return || def
}