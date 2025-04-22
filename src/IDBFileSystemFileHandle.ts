import { IDBFileSystemHandle } from "./IDBFileSystemHandle";
import {  IDBFileSystemFileHandleProvider, IIDBFileSystemFileHandle } from "./types/index";
import { HandleKind } from "./types/base";

export class IDBFileSystemFileHandle extends IDBFileSystemHandle implements IIDBFileSystemFileHandle {

    protected provider!: IDBFileSystemFileHandleProvider;

    /**
     * 类型
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/kind
     */
    get kind(): HandleKind {
        return "file"
    }


    /**
     * 创建一个 FileSystemWritableFileStream 对象，可用于写入文件。此方法返回一个可兑现这些写入流的 Promise 对象
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/createWritable
     */
    createWritable() {
        return this.provider.createWritable(this)
    }

    /**
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/getFile
     */
    getFile() {
        return this.provider.getFile(this)
    }

    // 定义一个名为 createSyncAccessHandle 的方法，该方法返回一个 Promise，该 Promise 解析为一个 ReadableStream 对象
    createSyncAccessHandle() {
        return this.provider.createSyncAccessHandle(this)
    }

}