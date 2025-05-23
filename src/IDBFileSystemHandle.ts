import { HandleKind } from "./types/base";
import { IDBFileSystemDirectoryHandleProvider, IDBFileSystemFileHandleProvider, IFileSystemHandle, PermissionOptions } from "./types/index";
import { FileSystemFileHandleMetaData, FileSystemHandleMetaData } from "./types/internal";
import { protectProperty, resolveToFullPath } from "./util/index";

export class IDBFileSystemHandle implements IFileSystemHandle {
    // provider的信息，会通过 Object.defineProperty 挂载
    protected provider!:  IDBFileSystemFileHandleProvider | IDBFileSystemDirectoryHandleProvider;

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
    isSameEntry(fileSystemHandle: IFileSystemHandle) {
        return this.provider.isSameEntry(this, fileSystemHandle)
    }

    /**
     * 删除
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/remove
     * @param options 
     */
    remove(options?: FileSystemRemoveOptions) {
        return this.provider.remove(this, options)
    }

    queryPermission(options?: PermissionOptions){
       return this.provider.queryPermission(this, options)
    }

    requestPermission(options?: PermissionOptions) {
        return this.provider.requestPermission(this, options)
    }
}


