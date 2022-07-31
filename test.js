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
