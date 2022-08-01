//队列模块
import BlueQueuePipe from "blue-queue-pipe";
import { STATUS } from "./status";

//key
type TKey = string;

//异步组项数据
interface TPendsItem {
  //当前队列
  queue: BlueQueuePipe;
  //当前同步状态 未存在记录时，第一次未CREATE状态
  status: STATUS;
  //数据
  data: any;
  //有效期 毫秒
  expire: number;
  //实际的实效时间
  expireTime: number;
}

//异步组数据
interface TPends {
  [key: string]: TPendsItem;
}

//所有通用的
interface TKeyOptions {
  key?: TKey;
}

// 异步组里面的项内同
interface TPendListenOptions extends TKeyOptions {
  //有效期 毫秒
  expire?: number;
  //队列处理
  success?: Function;
  //队列异常处理
  fail?: Function;
  //队列
  queue?: any[];
  //针对 blue-queue-pipe 的队列配置
  queueOptions?: any;
}

//load options
interface TLoadOptions {
  key?: TKey;
  data?: any;
  status?: STATUS;
}

interface TStatusOptions extends TKeyOptions {
  status?: STATUS;
}

interface TConstructorOptions {
  key?: TKey;
}

//生成状态判断
function conditionStatus(this: BluePend, opts: TStatusOptions): boolean {
  const { key = this.key, status } = opts;
  return status === this.getStatus({ key });
}

//默认key
const DEFAULT_KEY = `DEFAULT`;

export default class BluePend {
  //通过静态属性获取相关状态值
  static STATUS = STATUS;
  //异步组数据
  pends: TPends;
  //构造配置
  options: TConstructorOptions;
  key?: TKey;
  //构造
  constructor(opts: TConstructorOptions = {}) {
    this.options = opts;
    this.key = opts.key || DEFAULT_KEY;
    this.pends = {};
  }
  //hook处理
  hook(ctx: any, fn?: Function, args: any[] = []): any {
    if (typeof fn === `function`) {
      return fn.apply(ctx, args);
    }
    return fn;
  }

  //如果遇到了非CREATE状态，返回true
  //默认排除了CREATE状态，实际场景中，
  //CREATE状态只是为了铺垫第一次执行
  statusHook(opts: {
    key?: TKey;
    //create钩子
    createHook?: Function;
    //success钩子
    successHook?: Function;
    //fail钩子
    failHook?: Function;
    //pending钩子
    pendingHook?: Function;
    //默认排除create状态
    excludes: STATUS[];
    //执行load
    runQueue?: boolean;
  }) {
    const {
      key = this.key,
      createHook,
      successHook,
      failHook,
      pendingHook,
      excludes = [STATUS.CREATE],
      runQueue = true,
    } = opts;
    const keyOptions = {
      key,
    };
    const status = this.getStatus(keyOptions);
    //执行对应的状态队列
    const runQueueHandler = () => {
      //执行对应的状态队列
      this.runQueue({
        key,
        status,
      });
    };
    //如果当前的状态存在于的排除中，这里将不会进行处理
    for (let i = 0; i < excludes.length; i++) {
      const excStatus = excludes[i];
      if (excStatus === status) return false;
    }
    //apply处理参数
    const data = [this.getData(keyOptions)];
    switch (status) {
      case STATUS.CREATE:
        this.hook(null, createHook, data);
        return true;
      case STATUS.SUCCESS:
        this.hook(null, successHook, data);
        //执行对应的状态队列
        runQueue && runQueueHandler();
        return true;
      case STATUS.FAIL:
        this.hook(null, failHook, data);
        //执行对应的状态队列
        runQueue && runQueueHandler();
        return true;
      case STATUS.PENDING:
        this.hook(null, pendingHook, data);
        return true;
      default:
        return false;
    }
  }

  /*设置异步数据 CREATE[PENDING] -> SUCCESS[FAIL]
   如果当前为第一次写入唯一key时，第一次的状态为CREATE，
   如果在紧接着的处理中，下一个写入到唯一key的状态为PENDING，
   如果在写入的过程中，发现当前状态以及被修改为SUCCESS，这里将不会触发
   [堆积过程[CREATE|PENDING]] -> [回调流程[SUCCESS|FAIL]]*/
  listen(opts: TPendListenOptions): this {
    const {
      key = this.key,
      //有效期 毫秒
      expire = 0,
      //队列处理
      success,
      //队列异常处理
      fail,
      //队列
      queue = [],
      //针对 blue-queue-pipe 的队列配置
      queueOptions = {},
    } = opts;
    //key配置
    const keyOpts = {
      key,
    };
    //获取当前的同步项
    const currentPend = this.getListen(keyOpts);
    //队列回调
    let queueCallBlack = (data: any, status: STATUS): void => {
      if (status === STATUS.SUCCESS) {
        this.hook(null, success, [data]);
      } else {
        this.hook(null, fail, [data]);
      }
    };
    //存在当前的pend配置
    if (!currentPend) {
      //当前队列数据
      const currentQueue = new BlueQueuePipe(queueOptions);
      //预计的超时队列处理
      if (expire && queue.length > 0) {
        queue.forEach((_queue) => {
          //这里处理的queue都属于处理过的callback相关内容
          currentQueue.enqueue(_queue);
        });
      }
      //写入队列回调
      currentQueue.enqueue(queueCallBlack);
      //存储队列组
      this.pends[key] = {
        //当前队列
        queue: currentQueue,
        //当前同步状态 未存在记录时，第一次未CREATE状态
        status: STATUS.CREATE,
        //数据
        data: null,
        //有效期 毫秒
        expire,
        //实际的实效时间
        expireTime: expire ? +new Date() + expire : 0,
      };
    } else {
      //存在失效时间
      if (currentPend.expire && currentPend.expireTime < +new Date()) {
        //获取到当前的队列
        const currentQueue = this.getQueue(keyOpts).queue;
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
      const currentStatus = this.getStatus(keyOpts);
      //如果已经是成功或者失败状态，这里就不进行pending类型写入
      if (currentStatus === STATUS.SUCCESS || currentStatus === STATUS.FAIL) {
        //返回注销当前监听
        return this;
      }
      //写成pending状态
      this.setStatus({
        key,
        status: STATUS.PENDING,
      });
    }
    return this;
  }
  //设置
  getListen(opts: TKeyOptions = {}): TPendsItem {
    const { key = this.key } = opts;
    return this.pends[key];
  }
  //删除全部的监听
  removeListen(opts: TKeyOptions = {}): void {
    const { key = this.key } = opts;
    delete this.pends[key];
  }
  //设置异步数据
  setData(opts: { key?: TKey; data?: any }): any {
    const { key = this.key, data = null } = opts;
    return (this.getListen({ key }).data = data);
  }
  //获取数据
  getData(opts: TKeyOptions = {}): any {
    return this.getListen(opts).data;
  }
  //删除同步数据
  removeData(opts: TKeyOptions = {}) {
    this.getListen(opts).data = null;
  }
  //获取异步队列
  getQueue(opts: TKeyOptions = {}): BlueQueuePipe {
    return this.getListen(opts).queue;
  }
  //设置异步状态
  setStatus(opts: { key?: TKey; status: STATUS }) {
    const { key = this.key, status } = opts;
    this.getListen({ key }).status = status;
  }
  //设置异步状态
  getStatus(opts: TKeyOptions = {}): STATUS {
    return this.getListen(opts).status;
  }
  //执行同步队列
  runQueue(opts: TStatusOptions = {}) {
    const { key = this.key, status = STATUS.SUCCESS } = opts;
    this.getQueue({ key }).run(this.getData({ key }), status);
  }
  //完毕处理
  load(opts: TLoadOptions = {}): void {
    const { key = this.key, data = null, status = STATUS.SUCCESS } = opts;
    //load只受理SUCCESS和FAIL状态
    if (!(status === STATUS.SUCCESS || status === STATUS.FAIL)) return;
    //修改成功状态
    this.setStatus({
      key,
      status,
    });
    //设置当前key相关的数据值
    if (data !== undefined) {
      //设置数据
      this.setData({
        key,
        data,
      });
    }
    //执行同步队列
    this.runQueue({
      key,
      status,
    });
  }
}
