import { IDBFileSystemFileHandleMetaData, IDBFileSystemHandleMetaData, IDBStoreBaseItem, IDBStoreFileItem, IDBStoreInfoFileItem } from "../types";
import ObjectStore from "./ObjectStore";
import { IDBFileSystemFileHandle } from "../IDBFileSystemFileHandle";
import { IDBFileSystemDirectoryHandle } from "../IDBFileSystemDirectoryHandle";

export default class BaseProvider {
    constructor(
        protected infoStore: ObjectStore<string, IDBStoreBaseItem>,
        protected fileStore: ObjectStore<string, IDBStoreFileItem>
    ) {

    }

    protected setProvider(entry: IDBFileSystemFileHandle | IDBFileSystemDirectoryHandle, provider: BaseProvider = this) {
        Object.defineProperty(entry, "provider", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: Object.freeze(provider)
        })
    }

    protected setMetadata(entry: IDBFileSystemFileHandle | IDBFileSystemDirectoryHandle, metaData: IDBFileSystemHandleMetaData | IDBFileSystemFileHandleMetaData) {
        Object.defineProperty(entry, "metaData", {
            enumerable: false,
            configurable: false,
            writable: false,
            value: Object.freeze(metaData)
        })
    }

    getInfoItem(path: string) {
        return this.infoStore.get(path);
    }

    getFileItem(fileKey: string) {
        return this.fileStore.get(fileKey);
    }

}