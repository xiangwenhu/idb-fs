import { FileSystemHandleMetaData, HandleKind } from "./index";

export interface IFileSystemHandle {
    readonly kind: HandleKind;
    readonly name: string;
    isSameEntry(fileSystemHandle: IFileSystemHandle): Promise<boolean>;
    remove(options?: { recursive?: boolean }): Promise<undefined>;
}


