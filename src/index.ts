//队列模块
import BlueQueuePipe from "blue-queue-pipe";
import { ASYNC_STATUS } from "./status";

//生成状态判断
function conditionAsyncStatus(key: string, status: ASYNC_STATUS): boolean {
  return status === this.getAsyncStatus(key);
}

//生成状态回调处理
function asyncStatusHook(
  this: BluePend,
  status: ASYNC_STATUS,
  key: string,
  callback: Function
): boolean {
  if (this.getAsyncStatus(key) === status) {
    this.hook(null, callback);
    return true;
  }
  return false;
}

//异步组项数据
interface TASyncGroupItem {
  //当前队列
  queue: BlueQueuePipe;
  //当前同步状态 未存在记录时，第一次未CREATE状态
  status: ASYNC_STATUS;
  //数据
  data: any;
  //有效期 毫秒
  expire: number;
  //实际的实效时间
  expireTime: number;
}

//异步组数据
interface TAsyncGroup {
  [key: string]: TASyncGroupItem;
}

// 异步组里面的项内同
interface TAsyncOptions {
  key: string;
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

export default class BluePend {
  //通过静态属性获取相关状态值
  static ASYNC_STATUS = ASYNC_STATUS;
  //异步组数据
  asyncGroup: TAsyncGroup;
  //构造
  constructor() {
    this.asyncGroup = {};
  }

  //hook处理
  hook(ctx: any, fn: Function | any, args: any[] = []): any {
    if (typeof fn === `function`) {
      return fn.apply(ctx, args);
    }
    return fn;
  }

  /*设置异步数据 CREATE[PENDING] -> SUCCESS[FAIL]
   如果当前为第一次写入唯一key时，第一次的状态为CREATE，
   如果在紧接着的处理中，下一个写入到唯一key的状态为PENDING，
   如果在写入的过程中，发现当前状态以及被修改为SUCCESS，这里将不会触发
   [堆积过程[CREATE|PENDING]] -> [回调流程[SUCCESS|FAIL]]*/
  setAsync(opts: TAsyncOptions) {
    const {
      key,
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

    //获取当前的同步项
    const currentAsync = this.getAsync(key);
    //队列回调
    const queueCallBlack = (data: any, status: ASYNC_STATUS): void => {
      if (status === ASYNC_STATUS.SUCCESS) {
        this.hook(null, success, [data]);
      } else {
        this.hook(null, fail, [data]);
      }
    };

    if (!currentAsync) {
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
      this.asyncGroup[key] = {
        //当前队列
        queue: currentQueue,
        //当前同步状态 未存在记录时，第一次未CREATE状态
        status: ASYNC_STATUS.CREATE,
        //数据
        data: null,
        //有效期 毫秒
        expire,
        //实际的实效时间
        expireTime: expire ? +new Date() + expire : 0,
      };
    } else {
      //存在失效时间
      if (currentAsync.expire && currentAsync.expireTime < +new Date()) {
        //获取到当前的队列
        const currentQueue = this.getAsyncQueue(key).queue;
        //还有未处理的队列内容 存在于多频，超时处理较短情况来处理
        if (currentQueue.length > 0) {
          opts.queue = currentQueue;
        }
        //删除异步规则
        this.removeAsync(key);
        //设置新的规则
        return this.setAsync(opts);
      }
      //写入队列
      this.getAsyncQueue(key).enqueue(queueCallBlack);
      //如果已经是成功状态
      if (this.isSuccessStatus(key)) return;
      //写成pending状态
      this.setPendingStatus(key);
    }
  }
  //设置
  getAsync(key: string): TASyncGroupItem {
    return this.asyncGroup[key];
  }
  //删除同步挂载
  removeAsync(key: string): void {
    delete this.asyncGroup[key];
  }
  //设置异步数据
  setAsyncData(key: string, data: any): any {
    return (this.getAsync(key).data = data);
  }
  //获取数据
  getAsyncData(key: string): any {
    return this.getAsync(key).data;
  }
  //删除同步数据
  removeAsyncData(key: string) {
    this.getAsync(key).data = null;
  }
  //获取异步队列
  getAsyncQueue(key: string): BlueQueuePipe {
    return this.getAsync(key).queue;
  }
  //设置异步状态
  setAsyncStatus(key: string, status: ASYNC_STATUS): ASYNC_STATUS {
    return (this.getAsync(key).status = status);
  }
  //设置异步状态
  getAsyncStatus(key: string): ASYNC_STATUS {
    return this.getAsync(key).status;
  }
  //设置成功状态
  setPendingStatus(key: string) {
    this.setAsyncStatus(key, ASYNC_STATUS.PENDING);
  }
  //设置成功状态
  setSuccessStatus(key: string) {
    this.setAsyncStatus(key, ASYNC_STATUS.SUCCESS);
  }
  //设置成功状态
  setFailStatus(key: string) {
    this.setAsyncStatus(key, ASYNC_STATUS.FAIL);
  }
  //执行同步队列
  runAsyncQueue(key: string, status = ASYNC_STATUS.SUCCESS) {
    this.getAsyncQueue(key).run(this.getAsyncData(key), status);
  }
  //是否为创建状态
  isCreateStatus(key: string) {
    return conditionAsyncStatus.call(this, key, ASYNC_STATUS.CREATE);
  }
  //是否为为等待状态
  isPendingStatus(key: string) {
    return conditionAsyncStatus.call(this, key, ASYNC_STATUS.PENDING);
  }
  //是否为成功状态
  isSuccessStatus(key: string) {
    return conditionAsyncStatus.call(this, key, ASYNC_STATUS.SUCCESS);
  }
  //是否为错误状态
  isFailStatus(key: string) {
    return conditionAsyncStatus.call(this, key, ASYNC_STATUS.FAIL);
  }
  //同步创建处理钩子
  asyncCreateHook(key: string, callback: Function) {
    return asyncStatusHook.call(this, ASYNC_STATUS.CREATE, key, callback);
  }
  //同步等待处理钩子
  asyncPendingHook(key: string, callback: Function) {
    return asyncStatusHook.call(this, ASYNC_STATUS.PENDING, key, callback);
  }
  //同步成功处理钩子
  asyncSuccessHook(key: string, callback: Function) {
    return asyncStatusHook.call(this, ASYNC_STATUS.SUCCESS, key, callback);
  }
  //同步异常处理钩子
  asyncFailHook(key: string, callback: Function) {
    return asyncStatusHook.call(this, ASYNC_STATUS.FAIL, key, callback);
  }
  //异步完毕处理
  asyncLoad(opts: { key: string; data?: any; status?: ASYNC_STATUS }) {
    const { key = ``, data, status = ASYNC_STATUS.SUCCESS } = opts;
    //修改成功状态
    this.setAsyncStatus(key, status);
    //设置当前key相关的数据值
    if (data !== undefined) {
      //设置数据
      this.setAsyncData(key, data);
    }
    //执行同步队列
    this.runAsyncQueue(key, status);
  }
}
