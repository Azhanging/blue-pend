# blue-pend

## 使用场景

在实际的业务场景中，很多都会涉及到很多异步的场景，往往这些异步的场景
可能会很多生命周期场景中调用，这里就会出现如何去处理相关的后续的回调业务，

## 举个栗子：获取配置的场景

对于类似获取服务端配置问题，这里会涉及到 runtime 时，实际获取配置的时间会比 runtime 时间要长，这种情况下没处理想需要用的业务，这是需要用到异步队列去处理相关的业务。

## 如何使用？

先看个栗子 test.js

```javascript
const BluePend = require("./dist/blue-pend");

const pend = new BluePend();

function request(opts = {}) {
  const { key, success, fail, expire, error = false } = opts;
  //设置异步
  pend.setAsync({
    key,
    success,
    expire,
    fail,
  });
  return new Promise((resolve, reject) => {
    //如果当前key的状态以及是success，直接写回数据
    if (
      pend.asyncSuccessHook(key, () => {
        pend.runAsyncQueue(key);
        return resolve(pend.getAsyncData(key));
      }) ||
      //如果是pending状态，这里不做任何处理，上面只要关系写入async就好了
      pend.asyncPendingHook(key)
    ) {
      return;
    }
    //异步错误处理
    function asyncFailHandler(error) {
      pend.asyncLoad({
        key,
        data: error,
        status: BluePend.ASYNC_STATUS.FAIL,
      });
      reject(error);
    }
    if (!error) {
      const resData = {
        success: `success`,
      };
      //异步完毕处理 asyncLoad默认状态为SUCCESS
      pend.asyncLoad({
        key,
        data: resData,
      });
      resolve(resData);
    } else {
      //异步错误处理
      asyncFailHandler({
        error: `error`,
      });
    }
  });
}

request({
  key: `request-1`,
  success: () => {
    console.log(`request-1 success`, 0);
  },
  fail: () => {
    console.log(`request-1 error`, 0);
  },
}).catch((error) => {
  console.log(error);
});

request({
  key: `request-1`,
  success: () => {
    console.log(`request-1 success`, 1);
  },
  fail: () => {
    console.log(`request-1 success`, 1);
  },
}).catch((error) => {
  console.log(error);
});

setTimeout(() => {
  request({
    key: `request-1`,
    success: (data) => {
      console.log(`request-1 success`, 2, data);
    },
    fail: () => {
      console.log(`request-1 success`, 2, data);
    },
  }).catch((error) => {
    console.log(error);
  });
}, 1500);
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

以上面的栗子为例，在第一次进行 setAsync 的时候，这里的状态为 CREATE，再进行第二次对 request 调用是，第二次的 setAsync 检测到状态是 CREATE，这里将当前的 key 状态设置为 PENDING 进行结果等待，把相关的回调会进行队列处理。如果第一次 request 响应的结果是SUCCESS，这里将会对结果带入到队列处理。FAIL也会进行
