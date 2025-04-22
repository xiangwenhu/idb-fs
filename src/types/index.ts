import { HandleKind, TypedArray } from "./base";

export interface InstanceOptions {
    name: string;
}

export interface PermissionOptions {
    mode?: "readwrite" | "read";
}

export interface SyncAccessHandleOptions {
    mode: "read-only" | "readwrite" | "readwrite-unsafe"
}

export interface IFileSystemHandle {
    readonly kind: HandleKind;
    readonly name: string;
    isSameEntry(fileSystemHandle: IFileSystemHandle): Promise<boolean>;
    remove(options?: FileSystemRemoveOptions): Promise<void>;
    queryPermission(descriptor?: PermissionOptions): Promise<PermissionState>;
    requestPermission(descriptor?: PermissionOptions): Promise<PermissionState>;
}


export interface IIDBFileSystemWritableFileStream extends WritableStream {
    write(data: TypedArray): Promise<void>;
    seek(offset: number): Promise<void>;
    truncate(size: number): Promise<void>;
}


export interface IIDBFileSystemFileHandle extends IFileSystemHandle {
    readonly kind: HandleKind;
    createWritable(options?: FileSystemCreateWritableOptions): Promise<IIDBFileSystemWritableFileStream>;
    getFile(): Promise<File>;
    createSyncAccessHandle(): Promise<unknown>;
}

export interface IIDBFileSystemDirectoryHandle extends IFileSystemHandle {
    readonly kind: HandleKind;
    entries(): FileSystemDirectoryHandleAsyncIterator<[string, IFileSystemHandle]>;
    getDirectoryHandle(name: string, options?: FileSystemGetDirectoryOptions): Promise<IIDBFileSystemDirectoryHandle>;
    getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<IIDBFileSystemFileHandle>;
    keys(): FileSystemDirectoryHandleAsyncIterator<string>;
    removeEntry(name: string, options: FileSystemRemoveOptions): Promise<void>;
    resolve(possibleDescendant: IFileSystemHandle): Promise<string[] | null>;
    values(): FileSystemDirectoryHandleAsyncIterator<IFileSystemHandle>
}

export interface IDBFileSystemFileHandleProvider {
    isSameEntry(handle1: IFileSystemHandle, handle2: IFileSystemHandle): Promise<boolean>;
    remove(handle: IFileSystemHandle, options?: FileSystemRemoveOptions): Promise<void>;
    queryPermission(handle: IFileSystemHandle, descriptor?: PermissionOptions): Promise<PermissionState>;
    requestPermission(handle: IFileSystemHandle, descriptor?: PermissionOptions): Promise<PermissionState>;
    createWritable(handle: IFileSystemHandle, options?: FileSystemCreateWritableOptions): Promise<IIDBFileSystemWritableFileStream>;
    getFile(handle: IFileSystemHandle): Promise<File>;
    createSyncAccessHandle(handle: IFileSystemHandle): Promise<unknown>;
}
export interface IDBFileSystemDirectoryHandleProvider {
    isSameEntry(handle: IFileSystemHandle, handle2: IFileSystemHandle): Promise<boolean>;
    remove(handle: IFileSystemHandle, options?: FileSystemRemoveOptions): Promise<void>;
    queryPermission(handle: IFileSystemHandle, descriptor?: PermissionOptions): Promise<PermissionState>;
    requestPermission(handle: IFileSystemHandle, descriptor?: PermissionOptions): Promise<PermissionState>;
    entries(handle: IFileSystemHandle,): FileSystemDirectoryHandleAsyncIterator<[string, IFileSystemHandle]>;
    getDirectoryHandle(handle: IFileSystemHandle, name: string, options?: FileSystemGetDirectoryOptions): Promise<IIDBFileSystemDirectoryHandle>;
    getFileHandle(handle: IFileSystemHandle, name: string, options?: FileSystemGetFileOptions): Promise<IIDBFileSystemFileHandle>;
    keys(handle: IFileSystemHandle,): FileSystemDirectoryHandleAsyncIterator<string>;
    removeEntry(handle: IFileSystemHandle, name: string, options: FileSystemRemoveOptions): Promise<void>;
    resolve(handle: IFileSystemHandle, possibleDescendant: IFileSystemHandle): Promise<string[] | null>;
    values(handle: IFileSystemHandle,): FileSystemDirectoryHandleAsyncIterator<IFileSystemHandle>
}


