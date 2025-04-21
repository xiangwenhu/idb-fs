import { StoreInfoBaseItem, StoreFileItem, StoreInfoFileItem, InfoStoreKey } from "../types/index";
import ObjectStore from "./ObjectStore";
import { IDBFileSystemFileHandle } from "../IDBFileSystemFileHandle";
import Uint8ArrayWritableStream from "../Uint8ArrayWritableStream";
import BaseProvider from "./BaseProvider";
import { createDOMException } from "../util/error";
import { IDBFileSystemHandle } from "../IDBFileSystemHandle";

export default class FileProvider extends BaseProvider {
    constructor(
        infoStore: ObjectStore<InfoStoreKey, StoreInfoBaseItem>,
        fileStore: ObjectStore<string, StoreFileItem>
    ) {
        super(infoStore, fileStore)
    }


    async isSameEntry(handle1: IDBFileSystemHandle, handle2: IDBFileSystemHandle) {
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

    async getFile(fileHandle: IDBFileSystemFileHandle) {
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


    async createWritable(fileHandle: IDBFileSystemFileHandle) {
        const file = await this.getFile(fileHandle);
        const buffer = await file.arrayBuffer();
        const writableStream = new Uint8ArrayWritableStream(new Uint8Array(buffer), {
            onClose: async () => {
                const info: StoreInfoFileItem = (await this.infoStore.get([fileHandle.metaData.parentPath, fileHandle.name])) as StoreInfoFileItem;
                this.fileStore.put(writableStream.getResult(), info.fileKey);
            },
        });

        return writableStream;
    }

    async remove(fileHandle: IDBFileSystemFileHandle) {
        const info: StoreInfoBaseItem | undefined = await this.infoStore.get([fileHandle.metaData.parentPath, fileHandle.name]);
        this.checkFileInfo(info);
        const fileInfo = info as StoreInfoFileItem;

        await this.infoStore.delete([fileHandle.metaData.parentPath, fileHandle.name]);
        await this.fileStore.delete(fileInfo.fileKey);

        return undefined
    }

}