import { IDBHandleKind } from "./types";

export interface IDBFileSystemHandle {
    readonly kind: IDBHandleKind;
    readonly name: string;
    isSameEntry(fileSystemHandle: IDBFileSystemHandle): boolean;
    remove(options?: { recursive?: boolean }): Promise<undefined>;
}


