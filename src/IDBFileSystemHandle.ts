import { FileSystemFileHandleMetaData, FileSystemHandleMetaData, HandleKind } from "./types/index";
import { IFileSystemHandle } from "./types/IFileSystemHandle";
import { protectProperty, resolveToFullPath } from "./util/index";

export class IDBFileSystemHandle implements IFileSystemHandle {
    // provider的信息，会通过 Object.defineProperty 挂载
    protected provider!: any;

    // 目录名，会通过 Object.defineProperty 挂载
    protected handleName!: string;

    // 文件一些原始数据， 会通过 Object.defineProperty 挂载
    metaData!: FileSystemHandleMetaData | FileSystemFileHandleMetaData;

    constructor(handleName: string) {
        protectProperty(this, "handleName", handleName)
    }

    get fullPath(): string {
        return resolveToFullPath(this.metaData.parentPath, this.name)
    }

    // 定义一个名为 key 的 getter 方法
    get key(): [string, string] {
        // 返回一个数组，数组中包含 this.metaData 属性的值
        return [this.metaData.parentPath, this.name]
    }

    /**
     * 类型
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/kind
     */
    get kind(): HandleKind {
        throw new Error("Method not implemented.");
    }

    /**
     * 名称
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/name
     */
    get name() {
        return this.handleName
    }

    /**
 * 是不是同一个IDBFileSystemFileHandle
 * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/isSameEntry
 * @param fileSystemHandle 
 */
    isSameEntry(fileSystemHandle: IDBFileSystemHandle): Promise<boolean> {
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
}


