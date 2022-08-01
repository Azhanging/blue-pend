/*!
 * 
 * blue-pend.js 1.0.3
 * (c) 2016-2022 Blue
 * Released under the MIT License.
 * https://github.com/azhanging/blue-pend
 * time:Mon, 01 Aug 2022 16:42:53 GMT
 * 
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("blue-queue-pipe"));
	else if(typeof define === 'function' && define.amd)
		define(["blue-queue-pipe"], factory);
	else if(typeof exports === 'object')
		exports["BluePend"] = factory(require("blue-queue-pipe"));
	else
		root["BluePend"] = factory(root["BlueQuePipe"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE__1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./static";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var blue_queue_pipe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var blue_queue_pipe__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(blue_queue_pipe__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _status__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(2);
//队列模块


//生成状态判断
function conditionStatus(opts) {
    var _a = opts.key, key = _a === void 0 ? this.key : _a, status = opts.status;
    return status === this.getStatus({ key: key });
}
//默认key
var DEFAULT_KEY = "DEFAULT";
var BluePend = /** @class */ (function () {
    //构造
    function BluePend(opts) {
        if (opts === void 0) { opts = {}; }
        this.options = opts;
        this.key = opts.key || DEFAULT_KEY;
        this.pends = {};
    }
    //hook处理
    BluePend.prototype.hook = function (ctx, fn, args) {
        if (args === void 0) { args = []; }
        if (typeof fn === "function") {
            return fn.apply(ctx, args);
        }
        return fn;
    };
    //如果遇到了非CREATE状态，返回true
    //默认排除了CREATE状态，实际场景中，
    //CREATE状态只是为了铺垫第一次执行
    BluePend.prototype.statusHook = function (opts) {
        var _this = this;
        var _a = opts.key, key = _a === void 0 ? this.key : _a, createHook = opts.createHook, successHook = opts.successHook, failHook = opts.failHook, pendingHook = opts.pendingHook, _b = opts.excludes, excludes = _b === void 0 ? [_status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].CREATE] : _b, _c = opts.runQueue, runQueue = _c === void 0 ? true : _c;
        var keyOptions = {
            key: key,
        };
        var status = this.getStatus(keyOptions);
        //执行对应的状态队列
        var runQueueHandler = function () {
            //执行对应的状态队列
            _this.runQueue({
                key: key,
                status: status,
            });
        };
        //如果当前的状态存在于的排除中，这里将不会进行处理
        for (var i = 0; i < excludes.length; i++) {
            var excStatus = excludes[i];
            if (excStatus === status)
                return false;
        }
        //apply处理参数
        var data = [this.getData(keyOptions)];
        switch (status) {
            case _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].CREATE:
                this.hook(null, createHook, data);
                return true;
            case _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].SUCCESS:
                this.hook(null, successHook, data);
                //执行对应的状态队列
                runQueue && runQueueHandler();
                return true;
            case _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].FAIL:
                this.hook(null, failHook, data);
                //执行对应的状态队列
                runQueue && runQueueHandler();
                return true;
            case _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].PENDING:
                this.hook(null, pendingHook, data);
                return true;
            default:
                return false;
        }
    };
    /*设置异步数据 CREATE[PENDING] -> SUCCESS[FAIL]
     如果当前为第一次写入唯一key时，第一次的状态为CREATE，
     如果在紧接着的处理中，下一个写入到唯一key的状态为PENDING，
     如果在写入的过程中，发现当前状态以及被修改为SUCCESS，这里将不会触发
     [堆积过程[CREATE|PENDING]] -> [回调流程[SUCCESS|FAIL]]*/
    BluePend.prototype.listen = function (opts) {
        var _this = this;
        var _a = opts.key, key = _a === void 0 ? this.key : _a, 
        //有效期 毫秒
        _b = opts.expire, 
        //有效期 毫秒
        expire = _b === void 0 ? 0 : _b, 
        //队列处理
        success = opts.success, 
        //队列异常处理
        fail = opts.fail, 
        //队列
        _c = opts.queue, 
        //队列
        queue = _c === void 0 ? [] : _c, 
        //针对 blue-queue-pipe 的队列配置
        _d = opts.queueOptions, 
        //针对 blue-queue-pipe 的队列配置
        queueOptions = _d === void 0 ? {} : _d;
        //key配置
        var keyOpts = {
            key: key,
        };
        //获取当前的同步项
        var currentPend = this.getListen(keyOpts);
        //队列回调
        var queueCallBlack = function (data, status) {
            if (status === _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].SUCCESS) {
                _this.hook(null, success, [data]);
            }
            else {
                _this.hook(null, fail, [data]);
            }
        };
        //存在当前的pend配置
        if (!currentPend) {
            //当前队列数据
            var currentQueue_1 = new blue_queue_pipe__WEBPACK_IMPORTED_MODULE_0___default.a(queueOptions);
            //预计的超时队列处理
            if (expire && queue.length > 0) {
                queue.forEach(function (_queue) {
                    //这里处理的queue都属于处理过的callback相关内容
                    currentQueue_1.enqueue(_queue);
                });
            }
            //写入队列回调
            currentQueue_1.enqueue(queueCallBlack);
            //存储队列组
            this.pends[key] = {
                //当前队列
                queue: currentQueue_1,
                //当前同步状态 未存在记录时，第一次未CREATE状态
                status: _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].CREATE,
                //数据
                data: null,
                //有效期 毫秒
                expire: expire,
                //实际的实效时间
                expireTime: expire ? +new Date() + expire : 0,
            };
        }
        else {
            //存在失效时间
            if (currentPend.expire && currentPend.expireTime < +new Date()) {
                //获取到当前的队列
                var currentQueue = this.getQueue(keyOpts).queue;
                //还有未处理的队列内容 存在于多频，超时处理较短情况来处理
                if (currentQueue.length > 0) {
                    opts.queue = currentQueue;
                }
                //当前设置的回调进行失效处理
                queueCallBlack = null;
                //删除异步规则
                this.removeListen(keyOpts);
                //设置新的规则
                return this.listen(opts);
            }
            //写入队列
            this.getQueue(keyOpts).enqueue(queueCallBlack);
            //当前状态
            var currentStatus = this.getStatus(keyOpts);
            //如果已经是成功或者失败状态，这里就不进行pending类型写入
            if (currentStatus === _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].SUCCESS || currentStatus === _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].FAIL) {
                //返回注销当前监听
                return this;
            }
            //写成pending状态
            this.setStatus({
                key: key,
                status: _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].PENDING,
            });
        }
        return this;
    };
    //设置
    BluePend.prototype.getListen = function (opts) {
        if (opts === void 0) { opts = {}; }
        var _a = opts.key, key = _a === void 0 ? this.key : _a;
        return this.pends[key];
    };
    //删除全部的监听
    BluePend.prototype.removeListen = function (opts) {
        if (opts === void 0) { opts = {}; }
        var _a = opts.key, key = _a === void 0 ? this.key : _a;
        delete this.pends[key];
    };
    //设置异步数据
    BluePend.prototype.setData = function (opts) {
        var _a = opts.key, key = _a === void 0 ? this.key : _a, _b = opts.data, data = _b === void 0 ? null : _b;
        return (this.getListen({ key: key }).data = data);
    };
    //获取数据
    BluePend.prototype.getData = function (opts) {
        if (opts === void 0) { opts = {}; }
        return this.getListen(opts).data;
    };
    //删除同步数据
    BluePend.prototype.removeData = function (opts) {
        if (opts === void 0) { opts = {}; }
        this.getListen(opts).data = null;
    };
    //获取异步队列
    BluePend.prototype.getQueue = function (opts) {
        if (opts === void 0) { opts = {}; }
        return this.getListen(opts).queue;
    };
    //设置异步状态
    BluePend.prototype.setStatus = function (opts) {
        var _a = opts.key, key = _a === void 0 ? this.key : _a, status = opts.status;
        this.getListen({ key: key }).status = status;
    };
    //设置异步状态
    BluePend.prototype.getStatus = function (opts) {
        if (opts === void 0) { opts = {}; }
        return this.getListen(opts).status;
    };
    //执行同步队列
    BluePend.prototype.runQueue = function (opts) {
        if (opts === void 0) { opts = {}; }
        var _a = opts.key, key = _a === void 0 ? this.key : _a, _b = opts.status, status = _b === void 0 ? _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].SUCCESS : _b;
        this.getQueue({ key: key }).run(this.getData({ key: key }), status);
    };
    //完毕处理
    BluePend.prototype.load = function (opts) {
        if (opts === void 0) { opts = {}; }
        var _a = opts.key, key = _a === void 0 ? this.key : _a, _b = opts.data, data = _b === void 0 ? null : _b, _c = opts.status, status = _c === void 0 ? _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].SUCCESS : _c;
        //load只受理SUCCESS和FAIL状态
        if (!(status === _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].SUCCESS || status === _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"].FAIL))
            return;
        //修改成功状态
        this.setStatus({
            key: key,
            status: status,
        });
        //设置当前key相关的数据值
        if (data !== undefined) {
            //设置数据
            this.setData({
                key: key,
                data: data,
            });
        }
        //执行同步队列
        this.runQueue({
            key: key,
            status: status,
        });
    };
    //通过静态属性获取相关状态值
    BluePend.STATUS = _status__WEBPACK_IMPORTED_MODULE_1__["STATUS"];
    return BluePend;
}());
/* harmony default export */ __webpack_exports__["default"] = (BluePend);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__1__;

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "STATUS", function() { return STATUS; });
//异步状态 相关的状态
var STATUS;
(function (STATUS) {
    //创建状态
    STATUS["CREATE"] = "CREATE";
    //等待被消费
    STATUS["PENDING"] = "PENDING";
    //成功状态
    STATUS["SUCCESS"] = "SUCCESS";
    //异常状态
    STATUS["FAIL"] = "FAIL";
})(STATUS || (STATUS = {}));


/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=blue-pend.js.map