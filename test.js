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
          successHook: (data) => {
            return resolve(data);
          },
          failHook: (error) => {
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