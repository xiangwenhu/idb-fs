import { IDB_DATABASE_PREFIX,  IDB_DEFAULT_DATABASE_NAME,  NOT_SUPPORTED , IDB_DEFAULT_STORE_NAME} from "./const";
import IDBFileSystem from "./IDBFileSystem";
import IndexedDBProvider from "./IndexedDBProvider";
import { InstanceOptions } from "./types";
import { getDatabaseWithStore } from "./util/db";

export function isSupported() {
    return !!(self.indexedDB && self.IDBTransaction && self.IDBKeyRange)
}

const DefaultOptions: InstanceOptions = {
    name: IDB_DEFAULT_DATABASE_NAME
};


export function getInstance(options: InstanceOptions = DefaultOptions) {
    if (!isSupported()) return Promise.reject(NOT_SUPPORTED);
    const opts = Object.assign({}, DefaultOptions, options || {});

    const dbName = `${opts.name}`.trim();
    if (dbName === "") return Promise.reject(`无效的database name`);

    const fullDBName = `${IDB_DATABASE_PREFIX}_${dbName}`;
    const storeName = IDB_DEFAULT_STORE_NAME;

    return getDatabaseWithStore(1.0, fullDBName, storeName)
        .then(db => new IndexedDBProvider(db, storeName))
        .then(provider => new IDBFileSystem(provider))
}

