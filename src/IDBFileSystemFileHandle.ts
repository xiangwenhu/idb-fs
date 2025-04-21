import { IDBFileSystemHandle } from "./IDBFileSystemHandle";
import { HandleKind } from "./types/index";
import Uint8ArrayWritableStream from "./Uint8ArrayWritableStream";

export class IDBFileSystemFileHandle extends IDBFileSystemHandle {
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
    createWritable(): Promise<Uint8ArrayWritableStream> {
        return this.provider.createWritable(this)
    }

    /**
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileHandle/getFile
     */
    getFile(): Promise<File> {
        return this.provider.getFile(this)
    }

}