import BlueQueuePipe from "blue-queue-pipe";
import { ASYNC_STATUS } from "./status";
interface TASyncGroupItem {
    queue: BlueQueuePipe;
    status: ASYNC_STATUS;
    data: any;
    expire: number;
    expireTime: number;
}
interface TAsyncGroup {
    [key: string]: TASyncGroupItem;
}
interface TAsyncOptions {
    key: string;
    expire?: number;
    success?: Function;
    fail?: Function;
    queue?: any[];
    queueOptions?: any;
}
export default class BluePend {
    static ASYNC_STATUS: typeof ASYNC_STATUS;
    asyncGroup: TAsyncGroup;
    constructor();
    hook(ctx: any, fn: Function | any, args?: any[]): any;
    setAsync(opts: TAsyncOptions): any;
    getAsync(key: string): TASyncGroupItem;
    removeAsync(key: string): void;
    setAsyncData(key: string, data: any): any;
    getAsyncData(key: string): any;
    removeAsyncData(key: string): void;
    getAsyncQueue(key: string): BlueQueuePipe;
    setAsyncStatus(key: string, status: ASYNC_STATUS): ASYNC_STATUS;
    getAsyncStatus(key: string): ASYNC_STATUS;
    setPendingStatus(key: string): void;
    setSuccessStatus(key: string): void;
    setFailStatus(key: string): void;
    runAsyncQueue(key: string, status?: ASYNC_STATUS): void;
    isCreateStatus(key: string): any;
    isPendingStatus(key: string): any;
    isSuccessStatus(key: string): any;
    isFailStatus(key: string): any;
    asyncCreateHook(key: string, callback: Function): any;
    asyncPendingHook(key: string, callback: Function): any;
    asyncSuccessHook(key: string, callback: Function): any;
    asyncFailHook(key: string, callback: Function): any;
    asyncLoad(opts: {
        key: string;
        data?: any;
        status?: ASYNC_STATUS;
    }): void;
}
export {};
