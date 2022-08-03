# blue-pend

## 使用场景

在实际的业务场景中，很多都会涉及到很多异步的场景，往往这些异步的场景
可能会很多生命周期场景中调用，这里就会出现如何去处理相关的后续的回调业务，

## 举个栗子：获取配置的场景

对于类似获取服务端配置问题，这里会涉及到 runtime 时，实际获取配置的时间会比 runtime 时间要长，这种情况下没处理想需要用的业务，这是需要用到异步队列去处理相关的业务。

又或者说某些 SDK 触发的定位，实际可能再生命周期初期和到业务周期都是会触发定位的，这时候实际就只是触发一次，并且得到的结果响应到对应的回调中去。

## 如何使用？

先看个栗子 /test.js

```javascript
const BluePend = require("./dist/blue-pend");

//创建pend实例
const pend = new BluePend();

//假设这里就是请求
function request(opts = {}) {
  const { key, success, fail, expire, error = false } = opts;
  return new Promise((resolve, reject) => {
    //如果当前key的状态以及是success，直接写回数据
    if (
      pend
        //设置监听
        .listen({
          key,
          success,
          expire,
          fail,
        })
        //查看当前的status状态，
        //匹配到会进行对于的hook处理
        .statusHook({
          key,
          success: (data) => {
            return resolve(data);
          },
          fail: (error) => {
            return reject(error);
          },
        })
    ) {
      return;
    }

    //异步错误处理
    function failHandler(error) {
      pend.load({
        key,
        data: error,
        status: BluePend.STATUS.FAIL,
      });
      reject(error);
    }

    //没有错误走这里
    if (!error) {
      const resData = {
        success: `success`,
      };
      //异步完毕处理 load默认状态为SUCCESS
      pend.load({
        key,
        data: resData,
      });
      resolve(resData);
    } else {
      //异步错误处理
      failHandler({
        error: `error`,
      });
    }
  });
}

function genRequest(key, error) {
  //请求2的
  request({
    key,
    error,
    success: () => {
      console.log(`${key} success`);
    },
    fail: () => {
      console.log(`${key} error`);
    },
  })
    .then((data) => {
      console.log(`resolve`, data);
    })
    .catch((error) => {
      console.log(`reject`, error);
    });
}

//多个key的管理
//请求1
genRequest(`request-1`);
//请求2
genRequest(`request-2`, true);

//延迟处理
setTimeout(() => {
  console.log(`---------延迟处理---------`);
  genRequest(`request-2`);
  genRequest(`request-1`);
}, 1500);

//实例化时可配置key， 可以锁定所有prototype中的key值
const pendLockKey = new BluePend({
  key: `lockKey`,
});

//监听pend，这里的pend key为上面设置的lockKey
pendLockKey
  //监听1
  .listen({
    success: (data) => {
      console.log(`这是锁定的pend-0`, data);
    },
  })
  //监听2
  .listen({
    success: (data) => {
      console.log(`这是锁定的pend-1`, data);
    },
  })
  //监听3
  .listen({
    success: (data) => {
      console.log(`这是锁定的pend-2`, data);
    },
  });

console.log(`当前的状态`, pendLockKey.getStatus());

//默认的load状态为SUCCESS
pendLockKey.load({
  data: {
    success: `success`,
  },
});

console.log(`当前的状态`, pendLockKey.getStatus());

//也可以不进行key设置，默认key为DEFAULT
const pendLockKey1 = new BluePend();

//监听默认
pendLockKey1.listen({
  success: () => {
    console.log(`加载成功，pendLockKey1`);
  },
});

pendLockKey1.load();
```

上面的栗子中，实际处理只会进行一次网络请求，响应会进行两次响应，对应得到的响应结果也是一致的，对于配置类似的的请求，实际只会触发一次，并进行多点响应，具体是怎么样处理的，下面进行相关讲解。

实际场景会存在三个状态

```typescript
//异步状态 相关的状态
export enum ASYNC_STATUS {
  //创建状态
  CREATE = `CREATE`,
  //等待被消费
  PENDING = `PENDING`,
  //成功状态
  SUCCESS = `SUCCESS`,
  //异常状态
  FAIL = `FAIL`,
}
```

以上面的栗子为例，在第一次进行 listen 的时候，这里的状态为 CREATE，再进行第二次对 request 调用时，第二次的 listen 检测到状态是 CREATE，这里将当前的 key 状态设置为 PENDING 进行结果等待，把相关的回调会进行队列处理。如果第一次 request 响应的结果是 SUCCESS，这里将会对结果带入到队列处理。FAIL 也会进行结果处理，则为 fail 的处理

## 相关的原型方法

### listen() 方法的设置对于的 pend 回调信息，返回实例本身，key 规则不存在是，默认创建，第一次的状态为 CREATE

```typescript
listen({
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
}): BluePend
```

### getListen() 方法获取 key 相关的 listen

```typescript
getListen({
  key?: TKey;
}): boolean
```

### removeListen() 方法删除 key 相关的 listen

```typescript
removeListen({
  key?: TKey;
}): boolean
```

### setData() 方法设置对于 key 的 data 数据

```typescript
setData({
  key?: TKey;
  data?: any
}):any;
```

### getData() 方法获取对于 key 的 data 数据

```typescript
getData({
  key?: TKey;
}):any;
```

### removeData() 方法删除对于 key 的 data 数据

```typescript
removeData({
  key?: TKey;
});
```

### getQueue() 获取当前 key 的 BlueQueuePipe 队列实例

```typescript
getQueue({
  key?: TKey;
}): BlueQueuePipe;
```

### setStatus() 设置当前 key 的状态 

```typescript
setStatus({
  key?: TKey;
  status: STATUS
}): STATUS;
```

### getStatus() 获取当前 key 的 状态

```typescript
getStatus({
  key?: TKey;
}): STATUS;
```

### runQueue() 执行当前 key 对应的 status 的 BlueQueuePipe 队列，默认为 SUCCESS 状态

```typescript
runQueue({
  key?: TKey;
  status: STATUS = STATUS.SUCCESS;
});
```

### statusHook() 方法会匹配相关的状态，默认排除 CREATE 状态（实际场景中 CREATE 只是为了衬托出第一次创建的状态而存在，实际场景可以参照 test.js 中使用），存在于未有结果的状态的时候，后续将会匹配上，执行对于状态的 hook，配置中的，runQueue 会执行对应状态的 queue（这里的 queue 只会执行两种状态，SUCCESS 和 FAIL），并返回布尔值

```typescript
statusHook({
  key?: TKey;
  //create钩子
  create?: Function;
  //success钩子
  success?: Function;
  //fail钩子
  fail?: Function;
  //pending钩子
  pending?: Function;
  //默认排除create状态
  excludes?: STATUS[];
  //执行load
  runQueue?: boolean;
}): boolean
```

### load() 对于完成后进行调用的方法，该方法只支持当前的 pend 实例状态为 SUCCESS 或 FAIL 的情况下进行调用。这个方法调用完毕后等于锁定了当前的方法，status 的默认值为 SUCCESS，调用该方法会写完当前的状态，并且还会执行 runQueue。

```typescript
load({
  key?: TKey;
  data?: any;
  status?: STATUS;
})
```
