/**
 * handle type
 */
export type HandleKind = "file" | "directory";

/**
 * instance options
 */
export interface InstanceOptions {
    name?: string;
}

/**
 * 
 */
export interface StoreInfoBaseItem {
    kind: HandleKind;
    name: string;
    createTime: number;
    lastModifiedTime: number;
}

export interface StoreInfoFileItem extends StoreInfoBaseItem {
    /**
     * 文件的key
     */
    fileKey: string;
    /**
     * 媒体类型
     */
    type?: string; // mime type
}


export interface StoreInfoDirectoryItem extends StoreInfoBaseItem {
    kind: "directory"
}

export type StoreInfoItem = StoreInfoFileItem | StoreInfoDirectoryItem;


export type StoreFileItem = Uint8Array;


export interface RemoveEntryOptions {
    recursive?: boolean;
}

export interface GetHandleOptions {
    create?: boolean;
}

export interface FileSystemHandleMetaData {
    path: string;
}

export interface FileSystemFileHandleMetaData extends FileSystemHandleMetaData {
    fileKey: string;
}



export type TypedArray = Int8Array |
    Uint8Array |
    Uint8ClampedArray |
    Int16Array |
    Uint16Array |
    Int32Array |
    Uint32Array |
    // Float16Array |
    Float32Array |
    Float64Array;
// BigInt64Array |
// BigUint64Array;