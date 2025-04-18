export type IDBHandleKind = "file" | "directory";

export interface OpOptions {
    create?: boolean;
    exclusive?: boolean
}

export interface InstanceOptions {
    name?: string;
}

export interface IDBStoreBaseItem {
    kind: IDBHandleKind;
    name: string;
    createTime: number;
    lastModifiedTime: number;
}

kind: "file";
export interface IDBStoreInfoFileItem extends IDBStoreBaseItem {
    /**
     * 文件的key
     */
    fileKey: string;
    /**
     * 媒体类型
     */
    type?: string; // mime type
}


export interface IDBStoreInfoDirectoryItem extends IDBStoreBaseItem {
    kind: "directory"
}

export type IDBStoreInfoItem = IDBStoreInfoFileItem | IDBStoreInfoDirectoryItem;

export type IDBStoreFileItem = Uint8Array;


export interface RemoveEntryOptions {
    recursive?: boolean;
}

export interface GetHandleOptions { 
    create?: boolean;    
}