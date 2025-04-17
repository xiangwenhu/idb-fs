import { IDBFileSystemFileHandle } from "../IDBFileSystemFileHandle";
import { IDBFileSystemDirectoryHandle } from "../IDBFileSystemDirectoryHandle";
import { IDBStoreBaseItem, IDBStoreFileItem, IDBStoreInfoDirectoryItem, IDBStoreInfoFileItem } from "../types";
import BaseProvider from "./BaseProvider";
import ObjectStore from "./ObjectStore";
import { resolveToFullPath, uuid } from "../util/index";
import FileProvider from "./FileProvider";

export class DirectoryProvider extends BaseProvider {
    constructor(
        protected infoStore: ObjectStore<string, IDBStoreInfoFileItem | IDBStoreInfoDirectoryItem>,
        protected fileStore: ObjectStore<string, IDBStoreFileItem>,
        protected fileProvider: FileProvider
    ) {
        super(infoStore, fileStore)
    }

    entries() {

    }

   public toDirectoryHandle(info: IDBStoreBaseItem | string, fullPath: string) {
        const name = typeof info == "string" ? info : info.name;
        const handle = new IDBFileSystemDirectoryHandle(name);
        handle.path = fullPath;
        this.setProvider(handle);
        return handle
    }

    toFileHandle(info: IDBStoreBaseItem | string, fullPath: string) {
        const name = typeof info == "string" ? info : info.name;
        const handle = new IDBFileSystemFileHandle(name);
        handle.path = fullPath;
        this.setProvider(handle, this.fileProvider);
        return handle
    }

    async getDirectoryHandle(directory: IDBFileSystemDirectoryHandle, name: string, options?: {
        create?: boolean,
    }) {
        const fullPath = resolveToFullPath(directory.path, name);
        const dir = await this.getInfoItem(fullPath);

        if (dir) {
            if (dir.kind == "directory") return this.toDirectoryHandle(dir, fullPath);
            throw new DOMException("TypeMismatchError");
        }

        if (options?.create !== true) {
            throw new DOMException('NotFoundError');
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

    async getFileHandle(directory: IDBFileSystemDirectoryHandle, name: string, options?: {
        create?: boolean,
    }) {
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
            fileKey: fileKey
        }, fullPath);

        await this.fileStore.add(new Blob([]), fileKey);

        const handle = this.toFileHandle(name, fullPath)

        return handle
    }

}