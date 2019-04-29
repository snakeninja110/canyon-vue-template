/**
 * unicom 联通 想到中国联通就想到了这个名字 -_-
 * 目的，提供vue 全局的转发机制
 * [2018-01-18] 增加分组， 可以直接获取分组的 vm
 * [2018-01-25] 增加 unicom-id，确定vm的唯一值
 * [2018-02-07] 增加 ～ 表示，发送到还没创建的组件，目标组件创建的时候，会在created，收到unicom事件
 *              ~后面为空（不包含@#...）, 当目标组件被创建的时候，就会调用第二个函数参数
 * [2018-02-08] 在实例组件时，也可以设置分组 unicom-name
 */

import EventEmitter from './eventemitter'


let toString = Object.prototype.toString

// 事件
let unicom = new EventEmitter()

// vm容器
let vmMap = new Map()

// 转化为一维数组
function toOneArray(data, arr = [], fn, repetition = {}) {
    if (toString.call(data).toLowerCase() == '[object array]') {
        for (let i = 0; i < data.length; i += 1) {
            toOneArray(data[i], arr, fn, repetition)
        }
    } else if (data) {
        let key = fn ? fn(data) : data
        if(key === undefined){
            key = data
        }
        if(!repetition[key]){
            // 去重
            arr.push(key)
            repetition[key] = true
        }
    }
    return arr
}

// group Name
let unicomGroupName = ''
// 分组
let groupForVm = {}
function updateName(that, nv, ov){
    // 实例上设置分组
    let vmData = vmMap.get(this) || {}
    let group = vmData.group || []
    
    // 删除旧的 vm
    ov && toOneArray(ov).forEach(function(key){
        if(group.indexOf(key) < 0){
            let vms = groupForVm[key]
            vms && vms.splice(vms.indexOf(that), 1)
        }
    })

    // 增加新的
    toOneArray(nv).forEach(function(key){
        let vms = groupForVm[key]
        if(!vms){
            vms = groupForVm[key] = []
        }
        if(vms.indexOf(that) < 0){
            vms.push(that)
        }
    })
}

// 命名 唯一
let idForVm = {}
let unicomIdName = ''

function updateId(that, nv, ov) {
    if (nv == ov) {
        return
    }
    if (ov && idForVm[ov] == that) {
        // id被其他vm更新了，就不用删除了
        delete idForVm[ov]
    }
    if (nv) {
        idForVm[nv] = that
    }
}

// 交换 this 用
function sendSwitch(fn, that) {
    return function (toKey, aim, ...args) {
        if (aim == '#') {
            // id
            if (that[unicomIdName] != toKey) {
                // 目标不存在
                return
            }
        } else if (aim == '@') {
            // 分组
            let group = vmMap.get(that).group
            let name = that[unicomGroupName]
            let ns = name ? toOneArray(name) : []
            if ((!group || group.indexOf(toKey) < 0) && ns.indexOf(toKey) < 0) {
                // 目标不存在
                return
            }
        }

        fn.apply(that, args)
    }
}

function _unicomQuery(method, toKey, aim, args, that) {
    if (method) {
        args.unshift(method, toKey, aim, that)
        return unicom.emit.apply(unicom, args)
    }
}

// 推迟触发的事件
let sendDefer = []

// 发送容器 或者 获得 目标容器
function unicomQuery(query, ...args) {
    let toKey = '',
        aim = '',
        isDefer = false
    let method = query.replace(/^([`~])/, function (s0, s1) {
        if (s1 == '~') {
            isDefer = true
        }
        return ''
    }).replace(/([@#])([^@#]*)$/, function (s0, s1, s2) {
        toKey = s2
        aim = s1
        return ''
    })
    if (isDefer) {
        sendDefer.push([method, toKey, aim, args, this])
        return this
    }

    let flag = _unicomQuery(method, toKey, aim, args, this)

    // 获取目标 vm
    switch (aim) {
        case '#':
            return idForVm[toKey] || null
        case '@':
            return groupForVm[toKey] || []
    }
    return flag
}

// 安装配置 名称
export default function install(vue, {
    name = 'unicom',
    idName,
    groupName
} = {}) {
    if (install.installed) {
        return
    }
    install.installed = true

    vue.prototype['$' + name] = unicomQuery

    unicomIdName = idName || (name + 'Id')

    unicomGroupName = groupName || (name + 'Name')

    vue.mixin({
        props: {
            // 命名
            [unicomIdName]: {
                type: String,
                default: ''
            },
            // 分组
            [unicomGroupName]: {
                type: [String, Array],
                default: ''
            }
        },
        watch: {
            [unicomIdName](nv, ov) {
                updateId(this, nv, ov)
            },
            [unicomGroupName] : {
                deep: true,
                handler (nv, ov) {
                    updateName(this, nv, ov)
                }
            }
        },
        // 创建的时候，加入事件机制
        beforeCreate() {
            let opt = this.$options
            let us = opt[name]

            let vmData = {}
            let vmDataFlag = false
            let uni = vmData.uni = {}
            if (us && us.length) {
                vmDataFlag = true
                us.forEach((opt) => {
                    if (!opt) {
                        return
                    }
                    for (let n in opt) {
                        if (!uni[n]) {
                            uni[n] = []
                        }
                        let xfn = sendSwitch(opt[n], this)
                        uni[n].push(xfn)
                        unicom.on(n, xfn)
                    }
                })
            }

            // 命名分组
            let group = vmData.group = []
            toOneArray(opt[unicomGroupName], group, (data) => {
                let key = String(data)
                if (!groupForVm[key]) {
                    groupForVm[key] = []
                }
                groupForVm[key].push(this)
            })

            if (group.length > 0) {
                vmDataFlag = true
            }

            vmDataFlag && vmMap.set(this, vmData)
        },
        created() {
            // 实例命名 唯一
            let uId = this[unicomIdName]
            if (uId) {
                updateId(this, uId)
            }

            let uName = this[unicomGroupName]
            if (uName) {
                updateName(this, uName)
            }

            // 实例上设置分组
            let vmData = vmMap.get(this) || {}

            // 延后触发时，触发
            for (let i = 0; i < sendDefer.length; i += 1) {
                let pms = sendDefer[i]
                let [method, toKey, aim, args] = pms
                let flag = false

                if (aim == '#') {
                    if (toKey == uId) {
                        flag = true
                    }
                } else if (aim == '@') {
                    if (vmData.group && vmData.group.indexOf(toKey) > -1) {
                        flag = true
                    }
                } else {
                    if (method == '' || Object.keys(vmData.uni || {}).indexOf(method) > -1) {
                        flag = true
                    }
                }

                if (flag) {
                    // 找到 目标，触发事件
                    if (method == '') {
                        args[0](this)
                    } else {
                        sendDefer.splice(i, 1)
                        i -= 1
                        _unicomQuery.apply(this, pms)
                    }
                }
            }
        },
        // 全局混合， 销毁实例的时候，销毁事件
        destroyed() {
            // 移除唯一ID
            let id = this.unicomId
            if (id) {
                updateId(this, undefined, id)
            }

            // 移除 命名分组 实例命名
            let uName = this[unicomGroupName]
            if (uName) {
                updateName(this, undefined, uName)
            }

            let vmData = vmMap.get(this)
            if (!vmData) {
                return
            }

            vmMap.delete(this)

            let uni = vmData.uni
            // 移除事件
            for (let n in uni) {
                uni[n].forEach(function (fn) {
                    unicom.off(n, fn)
                })
            }

            // 分组，一对多， 单个vm可以多个分组名称 组件命名
            vmData.group.forEach((name) => {
                let gs = groupForVm[name]
                if (gs) {
                    let index = gs.indexOf(this)
                    if (index > -1) {
                        gs.splice(index, 1)
                    }
                    if (gs.length == 0) {
                        delete groupForVm[name]
                    }
                }
            })

            // 延后 销毁部分
            for (let i = 0; i < sendDefer.length;) {
                let pms = sendDefer[i]
                if(pms[0] == '' && pms[4] == this){
                    sendDefer.splice(i, 1)
                }
                else{
                    i+=1
                }
            }
        }
    })

    let merge = vue.config.optionMergeStrategies
    merge[name] = merge[unicomGroupName] = function (parentVal, childVal) {
        let x = []
        if (parentVal) {
            x.push(parentVal)
        }
        if (childVal) {
            x.push(childVal)
        }
        return x
    }
}