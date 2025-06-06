import { IDBFileSystemHandle } from "./IDBFileSystemHandle";
import { HandleKind } from "./types/base";
import { IDBFileSystemDirectoryHandleProvider, IFileSystemHandle, IIDBFileSystemDirectoryHandle } from "./types/index";

export class IDBFileSystemDirectoryHandle extends IDBFileSystemHandle implements IIDBFileSystemDirectoryHandle {

    protected provider!: IDBFileSystemDirectoryHandleProvider;

    /**
     * 类型
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemHandle/kind
     */
    get kind(): HandleKind {
        return "directory"
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
    getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions) {
        return this.provider.getDirectoryHandle(this, name, options)
    }


    /**
     * 返回一个位于调用此方法的目录句柄内带有指定名称的文件的 IDBFileSystemFileHandle
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/getFileHandle
     * 
     * @param name 
     * @param options 
     */
    getFileHandle(name: string, options?: FileSystemGetFileOptions) {
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
    removeEntry(name: string, options: FileSystemRemoveOptions) {
        return this.provider.removeEntry(this, name, options)
    }


    /**
     * 返回一个包含从父目录前往指定子条目中间的目录的名称的数组。数组的最后一项是子条目的名称。
     * @param possibleDescendant 
     */
    resolve(possibleDescendant: IFileSystemHandle) {
        return this.provider.resolve(this, possibleDescendant)
    }

    /**
     * 返回一个异步迭代器，用于迭代调用此方法的 IDBFileSystemDirectoryHandle 中的条目的值。
     * 参考：https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryHandle/values
     */
    values() {
        return this.provider.values(this)
    }
}