const weekDayArr = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
function wipeOut(date){
    //console.log('date', date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate())
    return new Date(date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate());
}

/**
 * 转换为Date对象
 * @param {Number, String, Date} date
 */
export function create(date, type = 0){
    let dt;
    if (date && date.constructor == Date) {
        // 克隆一个
        dt = new Date(date.getTime());
    }
    else{
        if (typeof date == 'string') {
            date = date.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?$/, function(str, Y, M, D, h, m, s){
                return Y + '/' + M + '/' + D + ' ' + (h || '00') + ':' + (m || '00') + ':' + (s || '00')
            }).replace(/\-/g, '\/').replace(/T/, ' ').replace(/\.\d+$/, '') // eslint-disable-line
        }
        dt = date ? new Date(date) : new Date();
    }

    if(type == 1){
        return wipeOut(dt)
    }
    return dt
}

/**
 * 将date格式化为固定格式的字符串
 * @param {Number, String, Date} date
 * @param {String} formatStr  YYYY YY MM M DD D hh h mm m ss s
 */
export function getDetail(date){
    date = create(date);
    let YYYY = date.getFullYear()
    let YY = date.getYear()
    let M = date.getMonth() + 1
    let MM = ('0' + M).slice(-2)
    let D = date.getDate()
    let DD = ('0' + D).slice(-2)
    let h = date.getHours()
    let hh = ('0' + h).slice(-2)
    let m = date.getMinutes()
    let mm = ('0' + m).slice(-2)
    let s = date.getSeconds()
    let ss = ('0' + s).slice(-2)
    let w = date.getDay()
    let W = weekDayArr[w]

    let diff = wipeOut(date).getTime() - wipeOut(create()).getTime()
    let X = diff == 86400000 ? '明天' : diff == 0 ? '今天' : W
    return {YYYY, YY, MM, M, DD, D, hh, h, mm, m, ss, s, w, W, X}
}
export function format(date, formatStr = 'YYYY-MM-DD'){
    let info = getDetail(date);
    for(let n in info){
        formatStr = formatStr.replace(new RegExp(n, 'g'), info[n]);
    }
    return formatStr;
}

export function diffByMinutes(minutes){
    let rv = []
    let h = Math.floor(minutes / 60)
    h && rv.push(h + '时')
    let m = (minutes % 60)
    m && rv.push(m + '分')
    return rv.join('') || '超光速'
}

/**
 * @description 添加n天，
 * @param {n} 天数
 * @param {date} 默认今天, 支持Date()/timestmap/Y-M-D/Y/M/D 等格式
 * @param {formatStr} 默认Y-M-D
 * @return {string} 返回处理后的时间对象, 包括时间戳/日期/详情信息
 */
export function addDay(n, date, formatStr) {
    let d = create(date);
    d.setDate(d.getDate() + (n || 0));
    if(formatStr){
        return format(d, formatStr)
    }
    return d
}
