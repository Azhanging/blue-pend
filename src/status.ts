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