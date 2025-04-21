import { DIR_SEPARATOR, FILE_ERROR, IDB_DATABASE_PREFIX, IDB_DEFAULT_DATABASE_NAME, IDB_FILE_STORE_NAME, IDB_INFO_STORE_NAME } from "./const/index";
import { DirectoryProvider } from "./provider/DirectoryProvider";
import FileProvider from "./provider/FileProvider";
import ObjectStore from "./provider/ObjectStore";
import { InfoStoreKey, InstanceOptions, StoreFileItem, StoreInfoItem } from "./types/index";
import { getDatabase } from "./util/db";
import { createDOMException } from "./util/error";
import { isValidDBName } from "./util/index";

const DefaultOptions: InstanceOptions = {
    name: IDB_DEFAULT_DATABASE_NAME
};

export function isSupported() {
    return !!(self.indexedDB && self.IDBTransaction && self.IDBKeyRange)
}

export function getInstance(options: InstanceOptions = DefaultOptions) {
    if (!isSupported()) return Promise.reject(createDOMException(DOMException.NOT_SUPPORTED_ERR, FILE_ERROR.NOT_SUPPORTED));

    const opts = Object.assign({}, DefaultOptions, options || {});

    if (!isValidDBName(opts.name!)) return Promise.reject(createDOMException(DOMException.INVALID_CHARACTER_ERR, FILE_ERROR.INVALID_DB_NAME));


    const dbName = `${opts.name}`.trim();
    if (dbName === "") return Promise.reject(`无效的database name`);

    const fullDBName = `${IDB_DATABASE_PREFIX}${dbName}`;
    const infoStoreName = IDB_INFO_STORE_NAME;
    const fileStoreName = IDB_FILE_STORE_NAME;

    return getDatabase({
        dbName: fullDBName,
        dbVersion: 1.0
    })
        .then(db => {

            // 初始化Store
            const infoStore = new ObjectStore<InfoStoreKey, StoreInfoItem>(db, { storeName: infoStoreName });
            const fileStore = new ObjectStore<string, StoreFileItem>(db, { storeName: fileStoreName });

            // 初始化Provider
            const fileProvider = new FileProvider(infoStore, fileStore);
            const directoryProvider = new DirectoryProvider(infoStore, fileStore, fileProvider);

            // 初始化根目录
            const rootDirectory = directoryProvider.createDirectoryHandle(DIR_SEPARATOR, DIR_SEPARATOR);
            return rootDirectory;
        })
}

export function getAllIDBFileSystem() {
    if (!isSupported()) return Promise.reject(createDOMException(DOMException.NOT_SUPPORTED_ERR, FILE_ERROR.NOT_SUPPORTED));
    return indexedDB.databases().then(dbs => {
        return dbs.filter(db => db.name && db.name.startsWith(IDB_DATABASE_PREFIX)).map(db => ({
            name: db.name!.replace(IDB_DATABASE_PREFIX, ""),
            version: db.version
        }));
    })
}