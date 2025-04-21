import { createDOMException } from "../util/error";
import { IDBFileSystemDirectoryHandle } from "../IDBFileSystemDirectoryHandle";
import { IDBFileSystemFileHandle } from "../IDBFileSystemFileHandle";
import { IDBFileSystemHandle } from "../IDBFileSystemHandle";
import { DIR_OPEN_BOUND, DIR_SEPARATOR } from "../const/index";
import { GetHandleOptions, StoreInfoBaseItem, StoreFileItem, StoreInfoDirectoryItem, StoreInfoFileItem, RemoveEntryOptions, InfoStoreKey, FileSystemFileHandleMetaData } from "../types/index";
import { checkFilename, createAsyncIteratorHoc, isString, isValidDirectoryName, isValidFileName, protectProperty, resolveToFullPath, uuid } from "../util/index";
import BaseProvider from "./BaseProvider";
import FileProvider from "./FileProvider";
import ObjectStore from "./ObjectStore";

export class DirectoryProvider extends BaseProvider {

    protected fileProvider!: FileProvider

    constructor(
        infoStore: ObjectStore<InfoStoreKey, StoreInfoFileItem | StoreInfoDirectoryItem>,
        fileStore: ObjectStore<string, StoreFileItem>,
        fileProvider: FileProvider
    ) {
        super(infoStore, fileStore)
        protectProperty(this, "fileProvider", fileProvider)
    }


    /**
     * 根据基本信息创建 IDBFileSystemDirectoryHandle 实例
     */
    public createDirectoryHandle(info: StoreInfoBaseItem | string, parentPath: string) {
        const name = typeof info == "string" ? info : info.name;
        const handle = new IDBFileSystemDirectoryHandle(name);
        this.setMetadata(handle, { parentPath })
        this.setProvider(handle);
        return handle
    }

    /**
     *  根据基本信息创建 IDBFileSystemFileHandle 实例
     */
    private createFileHandle(info: StoreInfoFileItem, parentPath: string) {
        // 根据 info 的类型确定文件名
        // 如果 info 是字符串类型，则直接使用该字符串作为文件名
        // 如果 info 是对象类型，则使用对象的 name 属性作为文件名
        const name = typeof info == "string" ? info : info.name;
        // 创建一个新的 IDBFileSystemFileHandle 实例，传入文件名
        const handle = new IDBFileSystemFileHandle(name);
        // 设置文件句柄的路径为传入的 fullPath
        this.setMetadata(handle, {
            parentPath,
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
        return handle1.fullPath === handle2.fullPath
    }

    async remove(handle: IDBFileSystemDirectoryHandle, options: RemoveEntryOptions = {}) {
        const info = await this.getInfoItemByHandle(handle);
        if (info == undefined) createDOMException(DOMException.NOT_FOUND_ERR)


        // 查询全部子目录或者文件
        const entries = await this.subEntries(handle, { recursive: true });
        if (entries.length > 0 && options.recursive !== true) {
            throw createDOMException(DOMException.INVALID_MODIFICATION_ERR);
        }
        // 删除目录或者文件
        for (let i = 0; i < entries.length; i++) {
            const [_key, item] = entries[i];
            await this.deleteInfoByHandle(item);
            if (item.kind == "file") {
                const fileKey =  ((item as IDBFileSystemFileHandle).metaData as FileSystemFileHandleMetaData).fileKey
                await this.fileStore.delete(fileKey);
            }
        }

        await this.deleteInfoByHandle(handle)
        return undefined
    }


    private querySubEntries<D = any>(query: IDBKeyRange | IDBValidKey | null,
        filter: (key: InfoStoreKey, item: StoreInfoBaseItem) => boolean,
        getData: (key: InfoStoreKey, item: StoreInfoBaseItem) => D) {

        const entries: D[] = [];
        return this.infoStore.openIndexCursor({
            name: "parentPath",
            type: "openCursor",
            query,
            direction: "next",
            onSuccess: (event: any) => {
                const cursor: IDBCursorWithValue = event.target.result;
                if (cursor) {
                    const key: InfoStoreKey = cursor.key as InfoStoreKey;
                    const item: StoreInfoBaseItem = cursor.value;

                    const isValid = filter(key, item);
                    if (isValid) {
                        const data = getData(key, item);
                        entries.push(data)
                    }
                    cursor.continue()
                }
            }
        }).then(() => {
            return entries
        })
    }

    private async subEntries(handle: IDBFileSystemDirectoryHandle, options?: { recursive: boolean }) {

        const parentPath = handle.fullPath;
        let lowerKey = parentPath;
        let upperKey: string | null = parentPath + DIR_OPEN_BOUND;

        let range: IDBKeyRange | IDBValidKey | null
        if (handle.metaData.parentPath === DIR_SEPARATOR && !!options?.recursive) {
            // 根目录 + 递归特别处理
            range = IDBKeyRange.lowerBound(DIR_SEPARATOR)
        } else {
            range = !!options?.recursive ? IDBKeyRange.bound(lowerKey, upperKey, false, true) : IDBKeyRange.only(parentPath);
        }

        const filter = (_key: any, _item: StoreInfoBaseItem) => {
            return true
        }

        const getData = (_key: any, item: StoreInfoBaseItem) => {
            const name = item.name;
            const parentPath = item.parentPath;
            const subHandle = item.kind == "directory" ? this.createDirectoryHandle(item, parentPath) : this.createFileHandle(item as StoreInfoFileItem, parentPath);
            return [name, subHandle] as [string, IDBFileSystemDirectoryHandle | IDBFileSystemFileHandle]
        }

        return this.querySubEntries<[string, IDBFileSystemDirectoryHandle | IDBFileSystemFileHandle]>(
            range,
            filter,
            getData
        )
    }

    entries(handle: IDBFileSystemDirectoryHandle) {
        const info = this.getInfoItemByHandle(handle);
        if (!info) throw createDOMException(DOMException.NOT_FOUND_ERR);
        return createAsyncIteratorHoc(() => this.subEntries(handle))
    }

    async getDirectoryHandle(handle: IDBFileSystemDirectoryHandle, name: string, options?: GetHandleOptions) {

        checkFilename(name);

        const parentPath = handle.fullPath;
        const info = await this.getInfoItem([parentPath, name]);

        if (info) {
            if (info.kind == "directory") return this.createDirectoryHandle(info, parentPath);
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
            parentPath
        });

        const targetHandle = this.createDirectoryHandle(name, parentPath)

        return targetHandle

    }

    async getFileHandle(handle: IDBFileSystemDirectoryHandle, name: string, options?: GetHandleOptions) {
        checkFilename(name);
        const parentPath = handle.fullPath;
        const info = await this.getInfoItem([parentPath, name]);

        if (info) {
            if (info.kind == "file") return this.createFileHandle(info as StoreInfoFileItem, parentPath);
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
            fileKey: fileKey,
            parentPath
        }

        await this.infoStore.add(fileInfo);

        await this.fileStore.add(new Uint8Array(), fileKey);

        const targetHandle = this.createFileHandle(fileInfo, parentPath)

        return targetHandle
    }

    keys(handle: IDBFileSystemDirectoryHandle) {
        const info = this.getInfoItemByHandle(handle);
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
        const parentPath = handle.fullPath;

        const subEntryKey: [string, string] = [parentPath, name];

        const info = await this.getInfoItem(subEntryKey);
        if (info == undefined) throw createDOMException(DOMException.NOT_FOUND_ERR);

        // 删除文件
        if (info.kind == "file") {
            await this.fileStore.delete((info as StoreInfoFileItem).fileKey);
            await this.infoStore.delete(subEntryKey);
            return undefined;
        }

        // 删除目录
        const subEntry = await this.getDirectoryHandle(handle, name);
        return this.remove(subEntry, options);

    }

    async resolve(handle1: IDBFileSystemDirectoryHandle, handle2: IDBFileSystemHandle) {
        const path1 = handle1.fullPath;
        const path2 = handle2.fullPath;
        if (path2.indexOf(path1) < 0) return null;
        return path2.substring(path1.length).split(DIR_SEPARATOR).filter(Boolean);
    }

    values(handle: IDBFileSystemDirectoryHandle) {
        const info = this.getInfoItemByHandle(handle);
        if (!info) throw createDOMException(DOMException.NOT_FOUND_ERR);
        return createAsyncIteratorHoc(() => this.subEntries(handle).then((entries) => entries.map((entry) => entry[1])))
    }
}