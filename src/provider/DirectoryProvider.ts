import { IDBFileSystemFileHandle } from "../IDBFileSystemFileHandle";
import { IDBFileSystemDirectoryHandle } from "../IDBFileSystemDirectoryHandle";
import { GetHandleOptions, IDBStoreBaseItem, IDBStoreFileItem, IDBStoreInfoDirectoryItem, IDBStoreInfoFileItem, RemoveEntryOptions } from "../types";
import BaseProvider from "./BaseProvider";
import ObjectStore from "./ObjectStore";
import { createAsyncIterator, createAsyncIteratorHoc, resolveToFullPath, uuid } from "../util/index";
import FileProvider from "./FileProvider";
import { IDBFileSystemHandle } from "../IDBFileSystemHandle";
import { DIR_OPEN_BOUND, DIR_SEPARATOR } from "src/const";

export class DirectoryProvider extends BaseProvider {
    constructor(
        protected infoStore: ObjectStore<string, IDBStoreInfoFileItem | IDBStoreInfoDirectoryItem>,
        protected fileStore: ObjectStore<string, IDBStoreFileItem>,
        protected fileProvider: FileProvider
    ) {
        super(infoStore, fileStore)
    }


    public toDirectoryHandle(info: IDBStoreBaseItem | string, fullPath: string) {
        const name = typeof info == "string" ? info : info.name;
        const handle = new IDBFileSystemDirectoryHandle(name);
        handle.path = fullPath;
        this.setProvider(handle);
        return handle
    }

    // 定义一个私有方法 toFileHandle，用于将给定的信息对象或字符串转换为文件句柄
    private toFileHandle(info: IDBStoreBaseItem | string, fullPath: string) {
        // 根据 info 的类型确定文件名
        // 如果 info 是字符串类型，则直接使用该字符串作为文件名
        // 如果 info 是对象类型，则使用对象的 name 属性作为文件名
        const name = typeof info == "string" ? info : info.name;
        // 创建一个新的 IDBFileSystemFileHandle 实例，传入文件名
        const handle = new IDBFileSystemFileHandle(name);
        // 设置文件句柄的路径为传入的 fullPath
        handle.path = fullPath;
        // 调用 setProvider 方法，为文件句柄设置文件提供者
        this.setProvider(handle, this.fileProvider);
        // 返回创建的文件句柄
        return handle
    }


    async isSameEntry(handle1: IDBFileSystemDirectoryHandle, handle2: IDBFileSystemDirectoryHandle) {
        if (handle1.kind !== 'directory' || handle2.kind !== 'directory') {
            return false
        }
        return handle1.path === handle2.path
    }

    private innerEntries(handle: IDBFileSystemDirectoryHandle) {
        let range: IDBKeyRange | undefined,
            entries: [string, IDBFileSystemDirectoryHandle | IDBFileSystemFileHandle][] = []
        if (handle.path != DIR_SEPARATOR && handle.path != '') {
            range = IDBKeyRange.bound(
                handle.path + DIR_SEPARATOR, handle.path + DIR_OPEN_BOUND, false, true)
        }
        let valPartsLen, fullPathPartsLen
        return this.infoStore.openCursor(range, "next", (event: any) => {
            const cursor: IDBCursorWithValue = event.target.result;
            if (cursor) {
                const key: string = cursor.key as string;
                const info: IDBStoreBaseItem = cursor.value;
                valPartsLen = key.split(DIR_SEPARATOR).length
                fullPathPartsLen = handle.path.split(DIR_SEPARATOR).length
                if (key !== DIR_SEPARATOR) {
                    // 区分根目录和非根目录
                    if (handle.path === DIR_SEPARATOR && valPartsLen < fullPathPartsLen + 1 ||
                        handle.path !== DIR_SEPARATOR && valPartsLen === fullPathPartsLen + 1) {
                        const subHandleKey = resolveToFullPath(handle.path, key);
                        const subHandle = info.kind == "directory" ? this.toDirectoryHandle(info, subHandleKey) : this.toFileHandle(info, subHandleKey);
                        entries.push([subHandleKey, subHandle]);
                    }
                }
                cursor['continue']()
            }
        }).then(() => {
            return entries
        })

    }


    entries(handle: IDBFileSystemDirectoryHandle) {
        return createAsyncIteratorHoc(() => this.innerEntries(handle))
    }

    async getDirectoryHandle(directory: IDBFileSystemDirectoryHandle, name: string, options?: GetHandleOptions) {
        const fullPath = resolveToFullPath(directory.path, name);
        const dir = await this.getInfoItem(fullPath);

        if (dir) {
            if (dir.kind == "directory") return this.toDirectoryHandle(dir, fullPath);
            throw new DOMException("", "TypeMismatchError");
        }

        if (options?.create !== true) {
            throw new DOMException("", 'NotFoundError');
        }

        const time = new Date().getTime();

        await this.infoStore.add({
            kind: "directory",
            name,
            createTime: time,
            lastModifiedTime: time,
        }, fullPath);

        const handle = this.toDirectoryHandle(name, fullPath)

        return handle

    }

    async getFileHandle(directory: IDBFileSystemDirectoryHandle, name: string, options?: GetHandleOptions) {
        const fullPath = resolveToFullPath(directory.path, name);
        const dir = await this.getInfoItem(fullPath);

        if (dir) {
            if (dir.kind == "file") return this.toFileHandle(dir, fullPath);
            throw new DOMException("TypeMismatchError");
        }

        if (options?.create !== true) {
            throw new DOMException('NotFoundError');
        }

        const time = new Date().getTime();

        const fileKey = uuid();
        await this.infoStore.add({
            kind: "file",
            name,
            createTime: time,
            lastModifiedTime: time,
            fileKey: fileKey,
        }, fullPath);

        await this.fileStore.add(new Uint8Array(), fileKey);

        const handle = this.toFileHandle(name, fullPath)

        return handle
    }

    keys(handle: IDBFileSystemDirectoryHandle) {
        return createAsyncIteratorHoc(() => this.innerEntries(handle).then((entries) => entries.map((entry) => entry[0])))
    }

    async removeEntry(handle: IDBFileSystemDirectoryHandle, name: string, options: RemoveEntryOptions) {
        const { path } = handle;

        const subPath = resolveToFullPath(path, name);
        const subEntry = this.getDirectoryHandle(handle, subPath);

        if (options?.recursive === true) {
            const entries = await this.innerEntries(this.toDirectoryHandle(name, subPath));
            if (entries.length === 0) {
                return undefined
            }
        }

        await this.infoStore.delete(subPath);

        return undefined

    }

}