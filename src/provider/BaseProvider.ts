import { PermissionOptions } from "../types/index";
import { IDBFileSystemDirectoryHandle } from "../IDBFileSystemDirectoryHandle";
import { IDBFileSystemFileHandle } from "../IDBFileSystemFileHandle";
import { IDBFileSystemHandle } from "../IDBFileSystemHandle";
import { FileSystemFileHandleMetaData, FileSystemHandleMetaData, InfoStoreKey, StoreFileItem, StoreInfoBaseItem } from "../types/internal";
import { createDOMException } from "../util/error";
import { protectProperty } from "../util/index";
import ObjectStore from "./ObjectStore";

/**
 * Base class for all providers
 */
export default class BaseProvider {

    /**
     * Info store
     */
    protected infoStore!: ObjectStore<InfoStoreKey, StoreInfoBaseItem>;
    /**
     * File store
     */
    protected fileStore!: ObjectStore<string, StoreFileItem>

    constructor(
        infoStore: ObjectStore<InfoStoreKey, StoreInfoBaseItem>,
        fileStore: ObjectStore<string, StoreFileItem>
    ) {
        protectProperty(this, "infoStore", infoStore);
        protectProperty(this, "fileStore", fileStore);
    }

    protected setProvider(handle: IDBFileSystemFileHandle | IDBFileSystemDirectoryHandle, provider: BaseProvider = this) {
        protectProperty(handle, "provider", provider);
    }

    protected setMetadata(handle: IDBFileSystemFileHandle | IDBFileSystemDirectoryHandle, metaData: FileSystemHandleMetaData | FileSystemFileHandleMetaData) {
        protectProperty(handle, "metaData", metaData);
    }

    getInfoItem(key: InfoStoreKey) {
        return this.infoStore.get(key);
    }

    getInfoItemByHandle(handle: IDBFileSystemHandle) {
        return this.infoStore.get(handle.key);
    }

    deleteInfoByHandle(handle: IDBFileSystemHandle) {
        return this.infoStore.delete(handle.key);
    }


    getFileItem(fileKey: string) {
        return this.fileStore.get(fileKey);
    }

    /**
     *  Check if the info item is a file
     */
    protected checkFileInfo(info: StoreInfoBaseItem | undefined) {
        if (!info) {
            throw createDOMException(DOMException.NOT_FOUND_ERR);
        }
        if (info.kind !== 'file') {
            throw createDOMException(DOMException.TYPE_MISMATCH_ERR);
        }
    }

    /**
     * Check if the info item is a directory
     */
    protected checkDirectoryInfo(info: StoreInfoBaseItem | undefined) {
        if (!info) {
            throw createDOMException(DOMException.NOT_FOUND_ERR);
        }
        if (info.kind !== 'directory') {
            throw createDOMException(DOMException.TYPE_MISMATCH_ERR);
        }
    }

    queryPermission(_fileHandle: IDBFileSystemFileHandle, _options?: PermissionOptions): Promise<PermissionState> {
        return Promise.resolve('granted')
    }

    requestPermission(_fileHandle: IDBFileSystemFileHandle, _options?: PermissionOptions): Promise<PermissionState> {
        return Promise.resolve('granted')
    }


}