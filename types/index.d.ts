import BlueQueuePipe from "blue-queue-pipe";
import { STATUS } from "./status";
declare type TKey = string;
interface TPendsItem {
    queue: BlueQueuePipe;
    status: STATUS;
    data: any;
    expire: number;
    expireTime: number;
}
interface TPends {
    [key: string]: TPendsItem;
}
interface TKeyOptions {
    key?: TKey;
}
interface TPendListenOptions extends TKeyOptions {
    expire?: number;
    success?: Function;
    fail?: Function;
    queue?: any[];
    queueOptions?: any;
}
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
export default class BluePend {
    static STATUS: typeof STATUS;
    pends: TPends;
    options: TConstructorOptions;
    key?: TKey;
    constructor(opts?: TConstructorOptions);
    hook(ctx: any, fn?: Function, args?: any[]): any;
    statusHook(opts: {
        key?: TKey;
        createHook?: Function;
        successHook?: Function;
        failHook?: Function;
        pendingHook?: Function;
        excludes: STATUS[];
        runQueue?: boolean;
    }): boolean;
    listen(opts: TPendListenOptions): this;
    getListen(opts?: TKeyOptions): TPendsItem;
    removeListen(opts?: TKeyOptions): void;
    setData(opts: {
        key?: TKey;
        data?: any;
    }): any;
    getData(opts?: TKeyOptions): any;
    removeData(opts?: TKeyOptions): void;
    getQueue(opts?: TKeyOptions): BlueQueuePipe;
    setStatus(opts: {
        key?: TKey;
        status: STATUS;
    }): void;
    getStatus(opts?: TKeyOptions): STATUS;
    runQueue(opts?: TStatusOptions): void;
    load(opts?: TLoadOptions): void;
}
export {};
