# util 
* [ajax.js](#ajax)
* [函数 misc.js](#misc)
* [url参数格式化 querystring.js](#querystring)
* [本地存储 storage.js](#storage)
* [日期格式化 date.js](#date)
* [cookie操作 cookie.js](#cookie)
* [自定义事件类 eventemitter.js](#eventemitter)
* [倒计时控件 timedown.js](#timedown)
* [获取汉子拼音首字母串数组 pinyin.js](#pinyin)
* [错误调试 debug.js](#debug)

## ajax #

```javascript
import ajax from 'koi/util/ajax'

// 单类ajax, 同一时刻，只有一个ajax
let jList = new ajax('url', 'GET').on('callback', function(res, req) {})

// 第一个参数为 ajax参数，第二个为true，第一个ajax请求会顶替上一个没完成的（上一个直接cancel）
jList.send({}， true)

// url、回调(callback)、参数
ajax.get('url', function(res, req){}, {})
ajax.post('url', function(res, req){}, {})
ajax.put('url', function(res, req){}, {})

// res 数据说明
res.result  后台返回的结果，可能是json、xml、text
res.text    后台返回的字符串
res.error   错误信息，如果没错误，值为 null
res.status  http状态，jsonp 无

// req 数据说明
req.param       参数
req.url     
req.method      get、post、put、jsonp
req.async       同步或者异步
req.qsParam     固定写在url上的参数
req.cache       是否去除get缓存
req.isFormData  模拟表单提交
req.isCross     是否跨域了

// ajax事件 通过on方法注册
open、send、callback、fail、success

```

## misc #

### forEach(arr, fun, exe, scope = this)
* 数据循环执行
* @param {Array、Object} arr 循环的数据
* @param {Function} fun 每次循环执行函数
* @param {Array|Object} exe fun return后推入exe中
* @param {*} scope fun this指向 


### loadJS(url, callback, charset)
* 动态加载 javascript
* @param url
* @param callback
* @param charset
* @returns {Element}

### getUUID()
* 获取页面唯一的 id 值
* @returns {string}

### getFullUrl(url)
* 获得url的真实地址(短路径 -### 全路径)
* @param url
* @returns {string}

### isEqual(a, b)
* 判断两组数据是否相同，深度匹配每个基本数据的值是否相同
* @param {*} a 
* @param {*} b 
* @returns {Boolean}

### mixin(target, ...objs)
 * 深度混合 对象
 * @param {Object|Array} target 
 * @param {Object|Array} objs 每个单元应该同　target 的数据类型一致

## querystring #
**格式化url后面的参数**

### parse(str)
* 将querystring字符串转 object
* @param {String} 
* a=1&b=2&b=3  -### {a:1,b:[2,3]} 

### getItem(key, str = location.search)
* 获取str中对应key的值
* @param {String} key 
* @param {String} str = location.search

### stringify(json)
* 将数据转换为 querystring 字符串 , 与 parse 相反
* @param {JSON} Object 数据对象
* @return {String} 
* {a:1,b:[2,3]} -### a=1&b=2&b=3

## storage #
本地存储可以设置过期时间，数据不存cookie

### getItem(key)
* 获取本地存储
* @param {String} key 

### setItem(key, value, expiration)
* 设置本地存储 item
* @param {String} key 
* @param {*} value 
* @param {Number|String|Date} expiration 0:进程，-1:永久，数字:天数，字符串，日期

### removeItem(key)
* 移除数据
* @param {String} key 

## date #

### create(date)
* 转换为Date对象
* @param {Number, String, Date} , 为空，为当前本地时间

### format(date, formatStr = 'YYYY-MM-DD')
* 将date格式化为固定格式的字符串
* @param {Number, String, Date} date 
* @param {String} formatStr  YYYY(年4) YY(年2) MM(月2) M(月) DD(日2) D(日) hh(时2) h(时) mm(分2) m(分) ss(秒2) s(秒)
* @return {String} 格式化过后的字符串

## cookie #

### getItem(key)
* 获取cookie
* @param {String} key 

### setItem(key, value, expiration, path, domain)
* 设置cookie
* @param {String} key 
* @param {String} value 
* @param {Number|String|Date} expiration 0:进程，-1:永久，数字:天数，字符串，日期
* @param {String} path 文档路径
* @param {String} domain 域名，可以设置主域名

### removeItem(key, path, domain)
* 移除cookie
* @param {*} key 
* @param {*} path 文档路径
* @param {*} domain 域名，可以设置主域名

## eventemitter #

用于处理自定义事件的，或者拦截器
### EventEmitter 这个是类

**以下列出的是原型方法**

### on(type, fun)
* 绑定事件
* @param type 事件名称
* @param fun 事件方法
* @returns {EventEmitter}

### hasEvent(type)
* 判断是否还有特定事件
* @param type
* @returns {Boolean}

### onec(type, fun)
* 只有执行一次的事件
* @param type 事件名称
* @param fun 事件方法
* @returns {EventEmitter}

### off(type[, fun])
* 移除事件
* @param type 事件名称
* @param fun 事件方法
* @returns {EventEmitter}

### emit(type, ...args)
* 触发事件
* @param {String} type 事件名称
* @param {*} ag 传递的参数

### assign(...args)
* 对自身 this 的扩展

## timedown #
### timeDown(time)
* 倒计时 函数
* @param {Number|String|Date} time 为数字时，代表，需要执行多少秒的倒计时 
* @return {eventemitter} 自定义事件对象
* @event change 事件，剩余时间 改变时触发，两个参数 第一个 diff 字符串 第二个diff（秒）
* @event end 倒计时结束时候调用

```javascript
// 随机倒计时， change事件中，将diff显示出来
timeDown(Math.round(Math.random() * 100) + 30)
.on('change', function(diff, time){
    i.timedown = time > 0 ? diff : '开始倒计时';
});
```

### timeDown.setGetNowFun(fn)
* 设置默认的获得当前时间函数，返回时间对象
* @param {Function} fn 

### timeDown.setGetDiff(fn)
* 设置默认的格式化时间差的函数
* @param {Function} fn 



## pinyin #
### getPinYin(str)
* 获取汉子拼音首字母串数组 default
* @param {String} str 汉子字符串 
* @return {Array} 拼音首字母数组

```javascript
import getPinYin from 'pinyin'

// 轨迹 拼音首字母数组
getPinYin('轨迹')

```

## debug #
### debug(debuger)
* 页面上出现各种颜色的调试信息
* @param {Object} debuger 输入的数据 

```javascript
import debug from 'debug'

// 轨迹 拼音首字母数组
debug({test:'这个是test信息'})

```