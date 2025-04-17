import { IDBStoreBaseItem, IDBStoreFileItem, IDBStoreInfoFileItem } from "../types";
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
            value: provider
        })
    }

    getInfoItem(path: string) {
        return this.infoStore.get(path);
    }

    getFileItem(fileKey: string) {
        return this.fileStore.get(fileKey);
    }

}