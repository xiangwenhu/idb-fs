import { IDBFileSystemFileHandleProvider, PermissionOptions } from "../types/index";
import { StoreInfoBaseItem, StoreFileItem, StoreInfoFileItem, InfoStoreKey } from "../types/internal";

import ObjectStore from "./ObjectStore";
import { IDBFileSystemFileHandle } from "../IDBFileSystemFileHandle";
import IDBFileSystemWritableFileStream from "../IDBFileSystemWritableFileStream";
import BaseProvider from "./BaseProvider";
import { createDOMException } from "../util/error";
import { IDBFileSystemHandle } from "../IDBFileSystemHandle";

export default class FileProvider extends BaseProvider implements IDBFileSystemFileHandleProvider {

    private writableCreate: boolean = false;

    constructor(
        infoStore: ObjectStore<InfoStoreKey, StoreInfoBaseItem>,
        fileStore: ObjectStore<string, StoreFileItem>
    ) {
        super(infoStore, fileStore)
    }




    async isSameEntry(handle1: IDBFileSystemHandle, handle2: IDBFileSystemHandle): Promise<boolean> {
        if (handle1.kind !== 'file' || handle2.kind !== 'file') {
            return false
        }
        if (handle1.metaData.parentPath !== handle2.metaData.parentPath) {
            return false
        }

        const handle1Info = (await this.getInfoItemByHandle(handle1)) as StoreInfoFileItem;
        const handle2Info = (await this.getInfoItemByHandle(handle2)) as StoreInfoFileItem;

        if (!handle1Info || !handle2Info) {
            return false
        }

        return handle1Info.fileKey === handle2Info.fileKey

    }

    async getFile(fileHandle: IDBFileSystemFileHandle): Promise<File> {
        const info: StoreInfoBaseItem | undefined = await this.infoStore.get([fileHandle.metaData.parentPath, fileHandle.name]);
        this.checkFileInfo(info);

        const fileInfo = info as StoreInfoFileItem;
        const data = await this.getFileItem(fileInfo.fileKey);
        if (!data) {
            // 未找到实际的文件，删除
            this.infoStore.delete([fileHandle.metaData.parentPath, fileHandle.name])
            throw createDOMException(DOMException.NOT_FOUND_ERR);
        }

        return new File([data], fileHandle.name, {
            lastModified: fileInfo.lastModifiedTime
        })
    }


    async createWritable(fileHandle: IDBFileSystemFileHandle, options?: FileSystemCreateWritableOptions) {
        let buffer: Uint8Array;
        if (options && options.keepExistingData === true) {
            const file = await this.getFile(fileHandle);
            const arrayBuffer = await file.arrayBuffer();
            buffer = new Uint8Array(arrayBuffer);
        } else {
            buffer = new Uint8Array(0);
        }
        const writableStream = new IDBFileSystemWritableFileStream(new Uint8Array(buffer), {
            onClose: async () => {
                const info: StoreInfoFileItem = (await this.infoStore.get([fileHandle.metaData.parentPath, fileHandle.name])) as StoreInfoFileItem;
                this.fileStore.put(writableStream.buffer, info.fileKey);
            },
        });

        return writableStream;
    }

    async remove(fileHandle: IDBFileSystemFileHandle): Promise<void> {
        const info: StoreInfoBaseItem | undefined = await this.infoStore.get([fileHandle.metaData.parentPath, fileHandle.name]);
        this.checkFileInfo(info);
        const fileInfo = info as StoreInfoFileItem;

        await this.infoStore.delete([fileHandle.metaData.parentPath, fileHandle.name]);
        await this.fileStore.delete(fileInfo.fileKey);
    }

    createSyncAccessHandle(fileHandle: IDBFileSystemFileHandle): Promise<unknown> {
        throw new Error("Method not implemented.");
    }

}