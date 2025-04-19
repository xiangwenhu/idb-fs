import { FileSystemFileHandleMetaData, FileSystemHandleMetaData, StoreInfoBaseItem, StoreFileItem, StoreInfoFileItem } from "../types/index";
import ObjectStore from "./ObjectStore";
import { IDBFileSystemFileHandle } from "../IDBFileSystemFileHandle";
import { IDBFileSystemDirectoryHandle } from "../IDBFileSystemDirectoryHandle";
import { protectProperty } from "../util/index";
import { createDOMException } from "../util/error";

export default class BaseProvider {

    protected infoStore!: ObjectStore<string, StoreInfoBaseItem>;
    protected fileStore!: ObjectStore<string, StoreFileItem>

    constructor(
        infoStore: ObjectStore<string, StoreInfoBaseItem>,
        fileStore: ObjectStore<string, StoreFileItem>
    ) {
        protectProperty(this, "infoStore", infoStore);
        protectProperty(this, "fileStore", fileStore);
    }

    protected setProvider(entry: IDBFileSystemFileHandle | IDBFileSystemDirectoryHandle, provider: BaseProvider = this) {
        protectProperty(entry, "provider", provider);
    }

    protected setMetadata(entry: IDBFileSystemFileHandle | IDBFileSystemDirectoryHandle, metaData: FileSystemHandleMetaData | FileSystemFileHandleMetaData) {
        protectProperty(entry, "metaData", metaData);
    }

    getInfoItem(path: string) {
        return this.infoStore.get(path);
    }

    getFileItem(fileKey: string) {
        return this.fileStore.get(fileKey);
    }

    protected checkFileInfo(info: StoreInfoBaseItem | undefined) {
        if (!info) {
            throw createDOMException(DOMException.NOT_FOUND_ERR);
        }
        if (info.kind !== 'file') {
            throw createDOMException(DOMException.TYPE_MISMATCH_ERR);
        }
    }

    protected checkDirectoryInfo(info: StoreInfoBaseItem | undefined) {
        if (!info) {
            throw createDOMException(DOMException.NOT_FOUND_ERR);
        }
        if (info.kind !== 'directory') {
            throw createDOMException(DOMException.TYPE_MISMATCH_ERR);
        }
    }

}