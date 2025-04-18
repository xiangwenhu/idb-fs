import { IDBFileSystemHandle } from "./IDBFileSystemHandle"
import { IDBFileSystemFileHandleMetaData, IDBHandleKind } from "./types"

export class IDBFileSystemFileHandle implements IDBFileSystemHandle {

    // @ts-ignore provider的信息，会通过 Object.defineProperty 挂载
    protected provider: any!;

    // @ts-ignore 文件一些原始数据， 会通过 Object.defineProperty 挂载
    metaData: IDBFileSystemFileHandleMetaData;

    constructor(private filename: string) {
    }

    /**
     * 类型
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/kind
     */
    get kind(): IDBHandleKind {
        return "file"
    }

    /**
     * 名称
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/name
     */
    get name() {
        return this.filename
    }

    /**
     * 是不是同一个IDBFileSystemFileHandle
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/isSameEntry
     * @param fileSystemHandle 
     */
    isSameEntry(fileSystemHandle: IDBFileSystemFileHandle): boolean {
        return this.provider.isSameEntry(this, fileSystemHandle)
    }

    /**
     * 删除
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/remove
     * @param options 
     */
    remove(): Promise<undefined> {
        return this.provider.remove(this)
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
    getFile(): Promise<File> {
        return this.provider.getFile(this)
    }

}