import { NOT_SUPPORTED } from "./const";
import IDBFileSystem from "./IDBFileSystem";
import IndexedDBProvider from "./IndexedDBProvider";
import { InstanceOptions } from "./types";
import { getDatabaseWithStore } from "./util/db";

export function isSupported() {
    return !!(self.indexedDB && self.IDBTransaction && self.IDBKeyRange)
}

const DefaultOptions: InstanceOptions = {
    storeName: "__idb_fs_store__",
    version: 1.0
};


export function getInstance(options: InstanceOptions = DefaultOptions) {
    if (!isSupported()) return Promise.reject(NOT_SUPPORTED);
    const opts = Object.assign({}, DefaultOptions, options || {});
    return getDatabaseWithStore(opts.version!, "__idb_fs__", opts.storeName!)
        .then(db => new IndexedDBProvider(db, opts.storeName!))
        .then(provider => new IDBFileSystem(provider))
}

