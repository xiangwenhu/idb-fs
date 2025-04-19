import { FileSystemHandleMetaData, HandleKind } from "./types/index";

export interface IDBFileSystemHandle {
    readonly kind: HandleKind;
    readonly name: string;
    isSameEntry(fileSystemHandle: IDBFileSystemHandle): Promise<boolean>;
    remove(options?: { recursive?: boolean }): Promise<undefined>;

    // 自定义的
    readonly metaData: FileSystemHandleMetaData
}


