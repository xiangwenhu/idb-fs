import { IDBFileSystemFileHandleMetaData, IDBFileSystemHandleMetaData, IDBStoreBaseItem, IDBStoreFileItem, IDBStoreInfoFileItem } from "../types";
import ObjectStore from "./ObjectStore";
import { IDBFileSystemFileHandle } from "../IDBFileSystemFileHandle";
import { IDBFileSystemDirectoryHandle } from "../IDBFileSystemDirectoryHandle";
import { protectProperty } from "../util/index";

export default class BaseProvider {

    protected infoStore!: ObjectStore<string, IDBStoreBaseItem>;
    protected fileStore!: ObjectStore<string, IDBStoreFileItem>

    constructor(
        infoStore: ObjectStore<string, IDBStoreBaseItem>,
        fileStore: ObjectStore<string, IDBStoreFileItem>
    ) {
        protectProperty(this, "infoStore", infoStore);
        protectProperty(this, "fileStore", fileStore); 
    }

    protected setProvider(entry: IDBFileSystemFileHandle | IDBFileSystemDirectoryHandle, provider: BaseProvider = this) {
        protectProperty(entry, "provider", provider);
    }

    protected setMetadata(entry: IDBFileSystemFileHandle | IDBFileSystemDirectoryHandle, metaData: IDBFileSystemHandleMetaData | IDBFileSystemFileHandleMetaData) {
        protectProperty(entry, "metaData", metaData);
    }

    getInfoItem(path: string) {
        return this.infoStore.get(path);
    }

    getFileItem(fileKey: string) {
        return this.fileStore.get(fileKey);
    }

}