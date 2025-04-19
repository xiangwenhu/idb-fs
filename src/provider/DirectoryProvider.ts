import { createDOMException } from "src/util/error";
import { IDBFileSystemDirectoryHandle } from "../IDBFileSystemDirectoryHandle";
import { IDBFileSystemFileHandle } from "../IDBFileSystemFileHandle";
import { IDBFileSystemHandle } from "../IDBFileSystemHandle";
import { DIR_OPEN_BOUND, DIR_SEPARATOR } from "../const/index";
import { GetHandleOptions, StoreInfoBaseItem, StoreFileItem, StoreInfoDirectoryItem, StoreInfoFileItem, RemoveEntryOptions } from "../types/index";
import { checkFilename, createAsyncIteratorHoc, isString, isValidDirectoryName, isValidFileName, protectProperty, resolveToFullPath, uuid } from "../util/index";
import BaseProvider from "./BaseProvider";
import FileProvider from "./FileProvider";
import ObjectStore from "./ObjectStore";

export class DirectoryProvider extends BaseProvider {

    protected fileProvider!: FileProvider

    constructor(
        infoStore: ObjectStore<string, StoreInfoFileItem | StoreInfoDirectoryItem>,
        fileStore: ObjectStore<string, StoreFileItem>,
        fileProvider: FileProvider
    ) {
        super(infoStore, fileStore)
        protectProperty(this, "fileProvider", fileProvider)
    }


    public createDirectoryHandle(info: StoreInfoBaseItem | string, fullPath: string) {
        const name = typeof info == "string" ? info : info.name;
        const handle = new IDBFileSystemDirectoryHandle(name);
        this.setMetadata(handle, { path: fullPath })
        this.setProvider(handle);
        return handle
    }

    // 定义一个私有方法 toFileHandle，用于将给定的信息对象或字符串转换为文件句柄
    private createFileHandle(info: StoreInfoFileItem, fullPath: string) {
        // 根据 info 的类型确定文件名
        // 如果 info 是字符串类型，则直接使用该字符串作为文件名
        // 如果 info 是对象类型，则使用对象的 name 属性作为文件名
        const name = typeof info == "string" ? info : info.name;
        // 创建一个新的 IDBFileSystemFileHandle 实例，传入文件名
        const handle = new IDBFileSystemFileHandle(name);
        // 设置文件句柄的路径为传入的 fullPath
        this.setMetadata(handle, {
            path: fullPath,
            fileKey: typeof info == "string" ? info : info.fileKey
        });
        // 调用 setProvider 方法，为文件句柄设置文件提供者
        this.setProvider(handle, this.fileProvider);
        // 返回创建的文件句柄
        return handle
    }


    async isSameEntry(handle1: IDBFileSystemDirectoryHandle, handle2: IDBFileSystemDirectoryHandle) {
        if (handle1.kind !== 'directory' || handle2.kind !== 'directory') {
            return false
        }
        return handle1.metaData.path === handle2.metaData.path
    }

    async remove(handle: IDBFileSystemDirectoryHandle, options: RemoveEntryOptions = {}) {
        const { metaData } = handle;
        const { path } = metaData;
        const info = await this.getInfoItem(path);
        if (info == undefined) createDOMException(DOMException.NOT_FOUND_ERR)


        // 查询全部子目录或者文件
        const entries = await this.subEntries(handle, { recursive: true });
        if (entries.length > 0 && options.recursive !== true) {
            throw createDOMException(DOMException.INVALID_MODIFICATION_ERR);
        }
        // 删除目录或者文件
        for (let i = 0; i < entries.length; i++) {
            const [key, item] = entries[i];
            await this.infoStore.delete(key);
            if (item.kind == "file") {
                await this.fileStore.delete((item as IDBFileSystemFileHandle).metaData.fileKey);
            }
        }

        await this.infoStore.delete(path);
        return undefined
    }


    private querySubEntries<D = any>(range: IDBKeyRange | undefined,
        filter: (key: string, item: StoreInfoBaseItem) => boolean,
        getData: (key: string, item: StoreInfoBaseItem) => D) {

        const entries: D[] = []

        return this.infoStore.openCursor(range, "next", (event: any) => {
            const cursor: IDBCursorWithValue = event.target.result;
            if (cursor) {
                const key: string = cursor.key as string;
                const item: StoreInfoBaseItem = cursor.value;

                const isValid = filter(key, item);
                if (isValid) {
                    const data = getData(key, item);
                    entries.push(data)
                }
                cursor.continue()
            }
        }).then(() => {
            return entries
        })

    }

    // private innerEntries(handle: IDBFileSystemDirectoryHandle) {
    //     let range: IDBKeyRange | undefined,
    //         entries: [string, IDBFileSystemDirectoryHandle | IDBFileSystemFileHandle][] = []
    //     if (handle.metaData.path != DIR_SEPARATOR && handle.metaData.path != '') {
    //         range = IDBKeyRange.bound(
    //             handle.metaData.path + DIR_SEPARATOR, handle.metaData.path + DIR_OPEN_BOUND, false, true)
    //     }
    //     let valPartsLen, fullPathPartsLen
    //     return this.infoStore.openCursor(range, "next", (event: any) => {
    //         const cursor: IDBCursorWithValue = event.target.result;
    //         if (cursor) {
    //             const key: string = cursor.key as string;
    //             const info: IDBStoreBaseItem = cursor.value;
    //             valPartsLen = key.split(DIR_SEPARATOR).length
    //             fullPathPartsLen = handle.metaData.path.split(DIR_SEPARATOR).length
    //             if (key !== DIR_SEPARATOR) {
    //                 // 区分根目录和非根目录
    //                 if (handle.metaData.path === DIR_SEPARATOR && valPartsLen < fullPathPartsLen + 1 ||
    //                     handle.metaData.path !== DIR_SEPARATOR && valPartsLen === fullPathPartsLen + 1) {
    //                     const subHandleKey = resolveToFullPath(handle.metaData.path, key);
    //                     const subHandle = info.kind == "directory" ? this.toDirectoryHandle(info, subHandleKey) : this.toFileHandle(info as IDBStoreInfoFileItem, subHandleKey);
    //                     entries.push([subHandleKey, subHandle]);
    //                 }
    //             }
    //             cursor.continue()
    //         }
    //     }).then(() => {
    //         return entries
    //     })
    // }

    private subEntries(handle: IDBFileSystemDirectoryHandle, options?: { recursive: boolean }) {

        let range: IDBKeyRange | undefined = undefined;
        let valPartsLen, fullPathPartsLen;

        if (handle.metaData.path != DIR_SEPARATOR && handle.metaData.path != '') {
            range = IDBKeyRange.bound(handle.metaData.path + DIR_SEPARATOR, handle.metaData.path + DIR_OPEN_BOUND, false, true)
        }

        const filter = options?.recursive === true ? (_key: any, _item: any) => {
            return true
        } : (key: string, _item: StoreInfoBaseItem) => {
            valPartsLen = key.split(DIR_SEPARATOR).length
            fullPathPartsLen = handle.metaData.path.split(DIR_SEPARATOR).length
            if (key !== DIR_SEPARATOR) {
                // 区分根目录和非根目录
                if (handle.metaData.path === DIR_SEPARATOR && valPartsLen < fullPathPartsLen + 1 ||
                    handle.metaData.path !== DIR_SEPARATOR && valPartsLen === fullPathPartsLen + 1) {
                    return true
                }
            }
            return false
        }

        const getData = (key: string, item: StoreInfoBaseItem) => {
            const subHandleKey = resolveToFullPath(handle.metaData.path, key);
            const subHandle = item.kind == "directory" ? this.createDirectoryHandle(item, subHandleKey) : this.createFileHandle(item as StoreInfoFileItem, subHandleKey);
            return [subHandleKey, subHandle] as [string, IDBFileSystemDirectoryHandle | IDBFileSystemFileHandle]
        }

        return this.querySubEntries<[string, IDBFileSystemDirectoryHandle | IDBFileSystemFileHandle]>(
            range,
            filter,
            getData
        )
    }

    entries(handle: IDBFileSystemDirectoryHandle) {
        const info = this.getInfoItem(handle.metaData.path);
        if (!info) throw createDOMException(DOMException.NOT_FOUND_ERR);
        return createAsyncIteratorHoc(() => this.subEntries(handle))
    }

    async getDirectoryHandle(directory: IDBFileSystemDirectoryHandle, name: string, options?: GetHandleOptions) {

        checkFilename(name);

        const fullPath = resolveToFullPath(directory.metaData.path, name);
        const dir = await this.getInfoItem(fullPath);

        if (dir) {
            if (dir.kind == "directory") return this.createDirectoryHandle(dir, fullPath);
            throw createDOMException(DOMException.TYPE_MISMATCH_ERR);
        }

        if (options?.create !== true) {
            throw createDOMException(DOMException.NOT_FOUND_ERR);
        }

        const time = new Date().getTime();

        await this.infoStore.add({
            kind: "directory",
            name,
            createTime: time,
            lastModifiedTime: time,
        }, fullPath);

        const handle = this.createDirectoryHandle(name, fullPath)

        return handle

    }

    async getFileHandle(directory: IDBFileSystemDirectoryHandle, name: string, options?: GetHandleOptions) {
        checkFilename(name);

        const fullPath = resolveToFullPath(directory.metaData.path, name);
        const info = await this.getInfoItem(fullPath);

        if (info) {
            if (info.kind == "file") return this.createFileHandle(info as StoreInfoFileItem, fullPath);
            throw createDOMException(DOMException.TYPE_MISMATCH_ERR);
        }

        if (options?.create !== true) {
            throw createDOMException(DOMException.NOT_FOUND_ERR);
        }

        const time = new Date().getTime();

        const fileKey = uuid();

        const fileInfo: StoreInfoFileItem = {
            kind: "file",
            name,
            createTime: time,
            lastModifiedTime: time,
            fileKey: fileKey
        }

        await this.infoStore.add(fileInfo, fullPath);

        await this.fileStore.add(new Uint8Array(), fileKey);

        const handle = this.createFileHandle(fileInfo, fullPath)

        return handle
    }

    keys(handle: IDBFileSystemDirectoryHandle) {
        const info = this.getInfoItem(handle.metaData.path);
        if (!info) throw createDOMException(DOMException.NOT_FOUND_ERR);
        return createAsyncIteratorHoc(() => this.subEntries(handle).then((entries) => entries.map((entry) => entry[0])))
    }

    async removeEntry(handle: IDBFileSystemDirectoryHandle, name: string, options: RemoveEntryOptions) {
        if (!isString(name)) {
            throw new TypeError("name is not a valid string")
        }

        if (!isValidFileName(name) && !isValidDirectoryName(name)) {
            throw new TypeError("name contains invalid characters")
        }

        const { metaData } = handle;

        const subPath = resolveToFullPath(metaData.path, name);

        const info = await this.getInfoItem(subPath);
        if (info == undefined) throw createDOMException(DOMException.NOT_FOUND_ERR);

        // 删除文件
        if (info.kind == "file") {
            await this.fileStore.delete((info as StoreInfoFileItem).fileKey);
            await this.infoStore.delete(subPath);
            return undefined;
        }

        // 删除目录
        const subEntry = await this.getDirectoryHandle(handle, subPath);
        return this.remove(subEntry, options);

    }

    async resolve(handle: IDBFileSystemDirectoryHandle, handle2: IDBFileSystemHandle) {
        const path1 = handle.metaData.path;
        const path2 = handle2.metaData.path;
        if (path2.indexOf(path1) < 0) return null;
        return path2.substring(path1.length).split(DIR_SEPARATOR);
    }

    values(handle: IDBFileSystemDirectoryHandle) {
        const info = this.getInfoItem(handle.metaData.path);
        if (!info) throw createDOMException(DOMException.NOT_FOUND_ERR);
        return createAsyncIteratorHoc(() => this.subEntries(handle).then((entries) => entries.map((entry) => entry[1])))
    }

}