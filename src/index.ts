import { IDB_DATABASE_PREFIX, IDB_DEFAULT_DATABASE_NAME, IDB_FILE_STORE_NAME, IDB_INFO_STORE_NAME, NOT_SUPPORTED } from "./const/index";
import IDBFileSystem from "./IDBFileSystem";
import StoreProvider from "./provider/index";
import ObjectStore from "./provider/ObjectStore";
import { IDBStoreBaseItem, IDBStoreFileItem, IDBStoreInfoItem, InstanceOptions } from "./types";
import { getDatabaseWithStore } from "./util/db";

const DefaultOptions: InstanceOptions = {
    name: IDB_DEFAULT_DATABASE_NAME
};

export function isSupported() {
    return !!(self.indexedDB && self.IDBTransaction && self.IDBKeyRange)
}

export function getInstance(options: InstanceOptions = DefaultOptions) {
    if (!isSupported()) return Promise.reject(NOT_SUPPORTED);
    const opts = Object.assign({}, DefaultOptions, options || {});

    const dbName = `${opts.name}`.trim();
    if (dbName === "") return Promise.reject(`无效的database name`);

    const fullDBName = `${IDB_DATABASE_PREFIX}_${dbName}`;
    const infoStoreName = IDB_INFO_STORE_NAME;
    const fileStoreName = IDB_FILE_STORE_NAME;

    return getDatabaseWithStore(1.0, fullDBName, [infoStoreName, fileStoreName])
        .then(db =>  {
            const infoStore = new ObjectStore<string, IDBStoreInfoItem>(db, {storeName: infoStoreName});
            const fileStore = new ObjectStore<string, IDBStoreFileItem>(db, {storeName: fileStoreName});
            const storeProvider = new StoreProvider(infoStore, fileStore);
            return new IDBFileSystem(storeProvider);            
        })
}

