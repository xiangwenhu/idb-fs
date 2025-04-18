import { NOT_IMPLEMENTED_ERROR } from "./const"
import { IDBFileSystemHandle } from "./IDBFileSystemHandle"
import { GetHandleOptions, IDBHandleKind, RemoveEntryOptions } from "./types"

export class IDBFileSystemDirectoryHandle implements IDBFileSystemHandle {

    // @ts-ignore
    protected provider: any!;

    path: string = "";

    constructor(private directoryName: string) {

    }

    /**
     * 类型
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/kind
     */
    get kind(): IDBHandleKind {
        return "directory"
    }

    /**
     * 名称
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/name
     */
    get name() {
        return this.directoryName
    }

    /**
     * 是不是同一个 IDBFileSystemDirectoryHandle
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/isSameEntry
     * @param fileSystemHandle 
     */
    isSameEntry(fileSystemHandle: IDBFileSystemDirectoryHandle): boolean {
        return this.provider.getDirectoryHandle(this, fileSystemHandle)
    }

    /**
     * https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/remove
     * @param options 
     */
    remove(): Promise<undefined> {
        throw NOT_IMPLEMENTED_ERROR
    }

    /**
     * 返回一个异步迭代器，用于迭代调用此方法的 FileSystemDirectoryHandle 中的条目的键值对。键值对是一个 [key, value] 形式的数组
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/entries
     * 
     */
    entries() {
        return this.provider.entries(this)
    }

    /**
     * 返回一个位于调用此方法的目录句柄内带有指定名称的子目录的 IDBFileSystemDirectoryHandle
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/getDirectoryHandle
     * 
     * @param name 
     * @param options 
     */
    getDirectoryHandle(name: string, options?: GetHandleOptions) {
        return this.provider.getDirectoryHandle(this, name, options)
    }


    /**
     * 返回一个位于调用此方法的目录句柄内带有指定名称的文件的 IDBFileSystemFileHandle
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/getFileHandle
     * 
     * @param name 
     * @param options 
     */
    getFileHandle(name: string, options?: GetHandleOptions) {
        return this.provider.getFileHandle(this, name, options)
    }

    /**
     * 返回一个异步迭代器，用于迭代调用此方法的 IDBFileSystemDirectoryHandle 中的条目的键。
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/keys
     */
    keys() {
        return this.provider.keys(this)
    }


    /**
     * 尝试将目录句柄内指定名称的文件或目录移除
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/removeEntry
     * @param name 
     * @param options 
     */
    removeEntry(name: string, options: RemoveEntryOptions) {
        return this.provider.removeEntry(this, name, options)
    }


    /**
     * 返回一个包含从父目录前往指定子条目中间的目录的名称的数组。数组的最后一项是子条目的名称。
     * @param possibleDescendant 
     */
    resolve(possibleDescendant: IDBFileSystemHandle) {
        throw NOT_IMPLEMENTED_ERROR
    }

    /**
     * 返回一个异步迭代器，用于迭代调用此方法的 IDBFileSystemDirectoryHandle 中的条目的值。
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/values
     */
    values() {
        return this.provider.values(this)
    }

}