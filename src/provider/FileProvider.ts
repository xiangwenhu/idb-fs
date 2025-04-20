import { StoreInfoBaseItem, StoreFileItem, StoreInfoFileItem } from "../types/index";
import ObjectStore from "./ObjectStore";
import { IDBFileSystemFileHandle } from "../IDBFileSystemFileHandle";
import Uint8ArrayWritableStream from "../Uint8ArrayWritableStream";
import BaseProvider from "./BaseProvider";
import { createDOMException } from "../util/error";
import { IDBFileSystemHandle } from "../IDBFileSystemHandle";

export default class FileProvider extends BaseProvider {
    constructor(
        infoStore: ObjectStore<string, StoreInfoBaseItem>,
        fileStore: ObjectStore<string, StoreFileItem>
    ) {
        super(infoStore, fileStore)
    }


    async isSameEntry(handle1: IDBFileSystemHandle, handle2: IDBFileSystemHandle) {
        if (handle1.kind !== 'file' || handle2.kind !== 'file') {
            return false
        }
        if (handle1.metaData.path !== handle2.metaData.path) {
            return false
        }

        const handle1Info = (await this.getInfoItem(handle1.metaData.path)) as StoreInfoFileItem;
        const handle2Info = (await this.getInfoItem(handle2.metaData.path)) as StoreInfoFileItem;

        if (!handle1Info || !handle2Info) {
            return false
        }

        return handle1Info.fileKey === handle2Info.fileKey

    }

    async getFile(fileHandle: IDBFileSystemFileHandle) {
        const info: StoreInfoBaseItem | undefined = await this.infoStore.get(fileHandle.metaData.path);
        this.checkFileInfo(info);

        const fileInfo = info as StoreInfoFileItem;
        const data = await this.getFileItem(fileInfo.fileKey);
        if (!data) {
            // 未找到实际的文件，删除
            this.infoStore.delete(fileHandle.metaData.path)
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
                const info: StoreInfoFileItem = (await this.infoStore.get(fileHandle.metaData.path)) as StoreInfoFileItem;
                this.fileStore.put(writableStream.getResult(), info.fileKey);
            },
        });

        return writableStream;
    }

    async remove(fileHandle: IDBFileSystemFileHandle) {
        const info: StoreInfoBaseItem | undefined = await this.infoStore.get(fileHandle.metaData.path);
        this.checkFileInfo(info);
        const fileInfo = info as StoreInfoFileItem;

        await this.infoStore.delete(fileHandle.metaData.path);
        await this.fileStore.delete(fileInfo.fileKey);

        return undefined
    }

}