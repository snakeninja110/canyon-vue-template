import EventEmitter from './eventemitter'

let doc = window.document

let isTouch = 'ontouchstart' in doc

let moveData

function getEventXY(ev){
    //移动是多点触控，默认使用第一个作为clientX和clientY
    if (ev.clientX == null) {
        let touches = ev.targetTouches && ev.targetTouches[0] ? ev.targetTouches : ev.changedTouches
        if (touches && touches[0]) {
            ev.clientX = touches[0].clientX
            ev.clientY = touches[0].clientY
            return [touches[0].clientX, touches[0].clientY]
        }
    }
    return [ev.clientX, ev.clientY]
}

let events = {
    move: isTouch? 'touchmove': 'mousemove',
    down: isTouch? 'touchstart': 'mousedown',
    up: isTouch? 'touchend': 'mouseup'
}
function appendEvent(dom, type, fn, cap){
    dom.addEventListener(events[type], fn, !!cap)
}
function removeEvent(dom, type, fn, cap){
    dom.removeEventListener(events[type], fn, !!cap)
}

function getMax(m, c){
    if(m == 0){
        return c
    }
    if(m < 0){
        return c < m ? m : (c > 0 ? 0 : c)
    }
    return c > m ? m : (c < 0 ? 0 : c)
}

//鼠标移动开始
function slipDown(ev){
    if(moveData){
        return
    }
    moveData = this
    appendEvent(doc, 'move', slipMove, true)
    appendEvent(doc, 'up', slipUp, true)
    let [x, y] = getEventXY(ev)
    this.bx = this.ax - x
    this.by = this.ay - y
    this.emit('start', ev)
}

function getSlipData(ev){
    let [x, y] = getEventXY(ev)
    return [getMax(moveData.mx, x + moveData.bx), getMax(moveData.my, y + moveData.by)]
    //moveData.emit(type, mx, my, ev)
    //return [mx, my]
}

//鼠标移动中
function slipMove(evt){
    if(moveData){
        window.getSelection ? window.getSelection().removeAllRanges() : doc.selection.empty()
        moveData.emit('move', ...getSlipData(evt), evt)
    }
}

//鼠标抬起
function slipUp(evt){
    if(moveData){
        removeEvent(doc, 'up', slipUp, true)
        removeEvent(doc, 'move', slipMove, true)
        let [x, y] = getSlipData(evt)
        this.ax = x
        this.ay = y
        moveData.emit('end', x, y, evt)
        moveData = null
    }
}

export default class slip extends EventEmitter {
    // 初始化
    constructor (id, mx, my) {
        super()

        this.dom = typeof id == 'string' ? doc.getElementById(id) : id
        this.ax = 0
        this.ay = 0

        this.mx = mx || 0
        this.my = my || 0

        appendEvent(this.dom, 'down', slipDown.bind(this))
    }

    // 清理
    setSkewing(x, y) {
        this.ax = getMax(this.mx, x || 0)
        this.ay = getMax(this.my, y || 0)
        return [this.ax, this.ay]
    }
}