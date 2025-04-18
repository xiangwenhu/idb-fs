import { IDBStoreBaseItem, IDBStoreFileItem, IDBStoreInfoFileItem } from "../types";
import ObjectStore from "./ObjectStore";
import { IDBFileSystemFileHandle } from "../IDBFileSystemFileHandle";
import Uint8ArrayWritableStream from "../Uint8ArrayWritableStream";
import BaseProvider from "./BaseProvider";
import { createDOMException } from "src/util/error";

export default class FileProvider extends BaseProvider {
    constructor(
        infoStore: ObjectStore<string, IDBStoreBaseItem>,
        fileStore: ObjectStore<string, IDBStoreFileItem>
    ) {
        super(infoStore, fileStore)
    }

    async isSameEntry(handle1: IDBFileSystemFileHandle, handle2: IDBFileSystemFileHandle) {
        if (handle1.kind !== 'file' || handle2.kind !== 'file') {
            return false
        }
        if (handle1.metaData.path !== handle2.metaData.path) {
            return false
        }

        const handle1Info = (await this.getInfoItem(handle1.metaData.path)) as IDBStoreInfoFileItem;
        const handle2Info = (await this.getInfoItem(handle2.metaData.path)) as IDBStoreInfoFileItem;

        if (!handle1Info || !handle2Info) {
            return false
        }

        return handle1Info.fileKey === handle2Info.fileKey

    }

    async getFile(fileHandle: IDBFileSystemFileHandle) {
        const info: IDBStoreBaseItem | undefined = await this.infoStore.get(fileHandle.metaData.path);
        if (!info) {
            throw createDOMException(DOMException.NOT_FOUND_ERR);
        }
        if (info.kind !== 'file') {
            throw createDOMException(DOMException.TYPE_MISMATCH_ERR);
        }

        const fileInfo = info as IDBStoreInfoFileItem;
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
        const writableStream = new Uint8ArrayWritableStream(new Uint8Array(buffer));

        writableStream.addEventListener("close", async () => {
            const info: IDBStoreInfoFileItem = (await this.infoStore.get(fileHandle.metaData.path)) as IDBStoreInfoFileItem;
            this.fileStore.put(writableStream.getResult(), info.fileKey);
        }, {
            once: true
        })

        return writableStream.getWriter()
    }

    async remove(fileHandle: IDBFileSystemFileHandle) {
        const info: IDBStoreBaseItem | undefined = await this.infoStore.get(fileHandle.metaData.path);
        if (!info) {
            throw createDOMException(DOMException.NOT_FOUND_ERR);
        }
        const fileInfo = info as IDBStoreInfoFileItem;

        await this.infoStore.delete(fileHandle.metaData.path);
        await this.fileStore.delete(fileInfo.fileKey);

        return undefined

    }
}