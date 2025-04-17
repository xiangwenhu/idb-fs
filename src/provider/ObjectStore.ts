
interface Options {
    storeName: string;
}

type StoreMethod = "add" | "clear" | "count" | "createIndex" | "delete" | "deleteIndex" |
    "get" | "getAll" | "getAllKeys" | "index" | "openCursor" | "openKeyCursor" | "put";


export default class ObjectStore<K = IDBValidKey | null, D = any> {

    constructor(protected db: IDBDatabase, protected options: Options) {
    }

    private get storeName() {
        return this.options.storeName
    }


    get transaction() {
        return this.db.transaction([this.storeName], "readwrite")
    }

    protected toPromise<R = any>(methodName: StoreMethod, ...args: any[]): Promise<R> {
        try {
            // let success: Function;
            // if (args.length >= 1 && typeof args[args.length - 1] === 'function') {
            //     success = args[args.length - 1]
            //     args = args.slice(0, args.length - 1)
            // }

            return new Promise((resolve, reject) => {
                // 获得事务
                const trans = this.transaction

                const store = trans.objectStore(this.storeName)
                const method = store[methodName];

                trans.objectStore(this.storeName)
                if (!method) reject(new Error(`objectStore不存在${methodName}`));

                // @ts-ignore
                const req: IDBRequest = method.call(store, ...args);
                //游标
                if (['openCursor', 'openKeyCursor'].indexOf(methodName) >= 0) {
                    req.onsuccess = function (event: any) {
                        resolve(event)
                    }
                    trans.oncomplete = function () {
                        return resolve(undefined as R)
                    }
                }
                else {
                    // 如果是onsuccess 就返回，只表示请求成功，当大文件存储的时候，并不是已经写入完毕才返回
                    //req.onsuccess = event => resolve(event.target.result)
                    trans.oncomplete = function () {
                        return resolve(req.result)
                    }
                    req.onsuccess = function () {
                        return resolve(req.result)
                    }
                }
                // 请求失败
                req.onerror = () => reject(req.error)
                // 事务失败
                trans.onerror = () => reject(trans.error)
            })
        } catch (err) {
            return Promise.reject(err)
        }
    }

    add(value: D, key?: K) {
        return this.toPromise<K>("add", value, key)
    }

    clear() {
        return this.toPromise<undefined>("clear");
    }

    count(key?: K | IDBKeyRange) {
        return this.toPromise<number>("count", key);
    }

    // 定义一个名为 createIndex 的方法，用于在数据库中创建索引
    // 定义一个名为 createIndex 的方法，用于在数据库中创建索引
    createIndex(name: string, keyPath: string | string[], options?: IDBIndexParameters) {
        return this.toPromise<IDBIndex>("createIndex", name, keyPath, options);
    }

    delete(key: K | IDBKeyRange) {
        return this.toPromise<undefined>("delete", key);
    }

    deleteIndex(name: string) {
        return this.toPromise<undefined>("deleteIndex", name);
    }

    get(key: K | IDBKeyRange) {
        return this.toPromise<D | undefined>("get", key);
    }

    getAll(query?: K | IDBKeyRange, count?: number) {
        return this.toPromise<D[]>("getAll", query, count);
    }

    getAllKeys(query?: K | IDBKeyRange, count?: number) {
        return this.toPromise<K[]>("getAllKeys", query, count);
    }

    index(name: string) {
        return this.toPromise<IDBIndex>("index", name);
    }

    openCursor(query?: K | IDBKeyRange, direction?: IDBCursorDirection) {
        return this.toPromise<IDBCursor | null>("openCursor", query, direction);
    }

    openKeyCursor(query?: K | IDBKeyRange, direction?: IDBCursorDirection) {
        return this.toPromise<IDBCursor | null>("openKeyCursor", query, direction);
    }

    put(value: D, key?: K) {
        return this.toPromise<K>("put", value, key);
    }

}
