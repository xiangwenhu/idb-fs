/** 一下是内部自用 */

import { HandleKind } from "./base";

export interface StoreInfoBaseItem {
    parentPath: string;
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



export interface FileSystemHandleMetaData {
    parentPath: string;
}

export interface FileSystemFileHandleMetaData extends FileSystemHandleMetaData {
    fileKey: string;
}


/**
 * [parentPath, name]; // 主键数组需严格对应字段顺序
 */
export type InfoStoreKey = [string, string];