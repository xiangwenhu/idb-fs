
export interface OpOptions {
    create?: boolean;
    exclusive?: boolean
}


export interface InstanceOptions {
    storeName?: string;
    version?: number
}


export declare class IEntry {
    isFile: boolean;
    isDirectory: boolean;
    name: string;
    fullPath: string;
    metadata: Metadata;
    private provider;
    constructor(isFile: boolean | undefined, isDirectory: boolean | undefined, name: string, fullPath: string);
    /**
     * 获取元数据 done
     */
    getMetadata(): Promise<Metadata>;
    moveTo(): void;
    copyTo(): void;
    toURL(): Promise<string>;
    /**
     * 删除  done
     */
    remove(): Promise<void>;
    /**
     * 获得父目录 done
     */
    getParent(): Promise<IDirectoryEntry>;
    protected dispatch<R = any>(method: string, ...args: any[]): Promise<R>;
}

export declare class IFSFile {
    name: string;
    size: number;
    type: string;
    createTime: Date;
    blob: Blob | undefined;
    lastModifiedTime: Date;
    constructor(name: string, size: number, type: string, createTime: Date, blob: Blob | undefined);
}


export declare class IFileEntry extends IEntry {
    file: IFSFile;
    constructor(name: string, fullPath: string, file: IFSFile);
    /**
     * FileEntry写入数据 done
     * @param {Blob|String|BufferArray} content
     * @param {String} type
     * @param {Boolean} append
     */
    write(content: any, type?: string, append?: boolean): Promise<void>;
    append(content: any): Promise<void>;
    getBlob(): Promise<Blob>;
    readAsArrayBuffer(): Promise<string>;
    readAsBinaryString(): Promise<string>;
    readAsDataURL(): Promise<string>;
    readAsText(encoding?: string): Promise<string>;
}

export declare class IDirectoryEntry extends IEntry {
    constructor(name: string, fullPath: string);
    /**
     * 获取文件 done
     * @param {String} path 路径
     * @param {Object} options  create:是否创建 ， exclusive 排他
     */
    getFile(path: string, options?: {
        create: boolean;
        exclusive: boolean;
    }): Promise<IFileEntry>;
    /**
     * 获取目录 done
     * @param {String} path
     * @param {Object} options
     */
    getDirectory(path: string, options?: OpOptions): Promise<IDirectoryEntry>;
    /**
     * 递归删除 done
     */
    remove(): Promise<void>;
    /**
     * 获取目录下的目录和文件
     */
    getEntries(): Promise<(IFileEntry | IDirectoryEntry)[]>;
    ensureDirectory(path: string): Promise<IDirectoryEntry>;
}
