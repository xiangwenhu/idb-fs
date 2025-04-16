import { DIR_OPEN_BOUND, DIR_SEPARATOR, FILE_ERROR } from "./const";
import { DirectoryEntry } from "./DirectoryEntry";
import { Entry } from "./Entry";
import { FileEntry } from "./FileEntry";
import { FileError } from "./FileError";
import { FSFile } from "./FSFile";
import { OpOptions } from "./types";
import { contentToBlob, promiseForEach, resolveToFullPath } from "./util/index";
import { readFile, ReadMethod } from "./util/reader";

export default class IndexedDBProvider {

    public root: DirectoryEntry = this.createDirectoryEntry('/', '/')

    constructor(private db: IDBDatabase, private storeName: string) {
    }

    get transaction() {
        return this.db.transaction([this.storeName], "readwrite")
    }

    private copyFrom(entry: FileEntry | DirectoryEntry) {
        const newEntry = entry.isFile ? this.createFileEntry(entry.name, entry.fullPath, (entry as FileEntry).file) :
            this.createDirectoryEntry(entry.name, entry.fullPath)
        newEntry.metadata = entry.metadata

        return newEntry
    }

    private setProvider(entry: FileEntry | DirectoryEntry) {
        Object.defineProperty(entry, "__provider__", {
            enumerable: false,
            configurable: false,
            value: this
        })
    }

    private createFileEntry(name: string, fullPath: string, file: FSFile) {
        const entry = new FileEntry(name, fullPath, file);
        this.setProvider(entry)
        return entry;
    }

    private createDirectoryEntry(name: string, fullPath: string) {
        const entry = new DirectoryEntry(name, fullPath);
        this.setProvider(entry)
        return entry;
    }


    protected toPromise<R = any>(method: keyof IDBObjectStore, ...args: any[]): Promise<R> {
        try {
            let success: Function;
            if (args.length >= 1 && typeof args[args.length - 1] === 'function') {
                success = args[args.length - 1]
                args = args.slice(0, args.length - 1)
            }

            return new Promise((resolve, reject) => {
                // 获得事务
                const trans = this.transaction
                // 获得请求
                // @ts-ignore
                const req = trans.objectStore(this.storeName)[method](...args)
                //游标
                if (['openCursor', 'openKeyCursor'].indexOf(method) >= 0 && success) {
                    req.onsuccess = function (event: any) {
                        success(event)
                    }
                    trans.oncomplete = function () {
                        return resolve(undefined as R)
                    }
                }
                else {
                    // 如果是onsuccess 就返回，只表示请求成功，当大文件存储的时候，并不是已经写入完毕才返回
                    //req.onsuccess = event => resolve(event.target.result)
                    trans.oncomplete = function () {
                        return resolve(req.result)
                    }
                    req.onsuccess = function () {
                        return resolve(req.result)
                    }
                }
                // 请求失败
                req.onerror = () => reject(req.error)
                // 事务失败
                trans.onerror = () => reject(trans.error)
            })
        } catch (err) {
            return Promise.reject(err)
        }
    }

    /**         * 
     * @param {Entry} entry 
     * @param {写入的内容} content 
     * @param {blob类型} type 
     * @param {是否是append模式} append 
     */
    protected write(entry: FileEntry, content: any, type = 'text/plain') {
        this.checkEntry(entry)
        if (entry.isFile !== true) {
            throw new FileError(FILE_ERROR.ONLY_FILE_WRITE)
        }
        let data = contentToBlob(content, type);

        const fileEntry = entry;

        let file = fileEntry.file
        if (!file) {
            // 不存在创建
            file = new FSFile(entry.fullPath.split(DIR_SEPARATOR).pop()!, data.size, type, new Date(), data)
            entry.metadata.lastModifiedDate = file.lastModifiedTime
            entry.metadata.size = data.size
            fileEntry.file = file
        } else {
            //存在更新
            file.lastModifiedTime = new Date()
            file.type = type
            file.size = data.size
            file.blob = data
            entry.metadata.lastModifiedDate = file.lastModifiedTime
            entry.metadata.size = data.size
        }

        return this.toPromise('put', entry, entry.fullPath).then(() => entry)
    }

    /**
     * 
     * @param {Entry} entry 
     * @param {String} path 
     * @param {Object} create 是否创建  exclusive排他
     */
    protected getFile(entry: FileEntry, path: string, options: OpOptions) {
        return this.getEntry(entry, path, options, true)
    }

    protected getDirectory(entry: DirectoryEntry, path: string, options: OpOptions) {
        return this.getEntry(entry, path, options, false)
    }

    protected remove(entry: Entry) {
        this.checkEntry(entry)
        return this.toPromise('delete', entry.fullPath).then(() => true)
    }

    protected removeRecursively(entry: Entry) {
        this.checkEntry(entry)
        const range = IDBKeyRange.bound(entry.fullPath, entry.fullPath + DIR_OPEN_BOUND, false, true)
        return this.toPromise('delete', range).then(() => true)
    }

    /**
     * 获得元数据
     * @param {Entry} entry 
     */
    protected getMetadata(entry: Entry) {
        // @ts-ignore
        const f = entry.file || {}
        return new Metadata(f && f.lastModifiedDate || null, f && f.size || 0)
    }

    /**
     * 获取文件或者目录
     * @param {Entry} entry 
     * @param {String} path 
     * @param {String} param2 
     * @param {Boolean} getFile true获取文件 false 获取目录
     */
    protected getEntry(entry: FileEntry | DirectoryEntry, path: string, { create, exclusive = false }: OpOptions, getFile: boolean = true) {
        this.checkEntry(entry)
        if (path === DIR_SEPARATOR) {
            // 如果获取'/'直接返回当前目录
            return entry
        }
        path = resolveToFullPath(entry.fullPath, path)
        return this.toPromise('get', path).then((fe: FileEntry | DirectoryEntry) => {
            if (create === true && exclusive === true && fe) {
                //创建 && 排他 && 存在
                throw new FileError(getFile ? FILE_ERROR.FILE_EXISTED : FILE_ERROR.Directory_EXISTED)
            } else if (create === true && !fe) {
                //创建 && 文件不存在
                const name = path.split(DIR_SEPARATOR).pop() || "";

                const fileE = getFile ? new FSFile(name, 0, "", new Date(), undefined) : null;

                const newEntry = getFile ? this.createFileEntry(name, path, fileE!) : this.createDirectoryEntry(name, path);

                return this.toPromise('put', newEntry, newEntry.fullPath).then(() => {
                    return this.copyFrom(newEntry)
                })
            } else if (!create && !fe) {
                // 不创建 && 文件不存在
                return undefined
            } else if (fe && fe.isDirectory && getFile || fe && fe.isFile && !getFile) {
                // 不创建 && entry存在 && 是目录 && 获取文件 || 不创建 && entry存在 && 是文件 && 获取目录
                throw new FileError(getFile ? FILE_ERROR.Directory_EXISTED : FILE_ERROR.FILE_EXISTED)
            } else {
                return this.copyFrom(fe)
            }
        })
    }

    /**
     * 获得父目录
     * @param {Entry} entry 
     */
    protected getParent(entry: Entry) {
        this.checkEntry(entry)
        // 已经是根目录
        if (entry.fullPath === DIR_SEPARATOR) {
            return entry
        }
        const parentFullPath = entry.fullPath.substring(0, entry.fullPath.lastIndexOf(DIR_SEPARATOR))
        //上级目录为根目录的情况
        if (parentFullPath === '') {
            return this.root
        }
        return this.getDirectory(this.root, parentFullPath, { create: false })
    }

    /**
     * 获得目录下的目录和文件
     * @param {Entry} entry 
     */
    protected getEntries(entry: Entry) {
        let range = null,
            results: Entry[] = []
        if (entry.fullPath != DIR_SEPARATOR && entry.fullPath != '') {
            range = IDBKeyRange.bound(
                entry.fullPath + DIR_SEPARATOR, entry.fullPath + DIR_OPEN_BOUND, false, true)
        }
        let valPartsLen, fullPathPartsLen
        return this.toPromise('openCursor', range, (event: any) => {
            const cursor: IDBCursorWithValue = event.target.result;
            if (cursor) {
                const val = cursor.value
                valPartsLen = val.fullPath.split(DIR_SEPARATOR).length
                fullPathPartsLen = entry.fullPath.split(DIR_SEPARATOR).length
                if (val.fullPath !== DIR_SEPARATOR) {
                    // 区分根目录和非根目录
                    if (entry.fullPath === DIR_SEPARATOR && valPartsLen < fullPathPartsLen + 1 ||
                        entry.fullPath !== DIR_SEPARATOR && valPartsLen === fullPathPartsLen + 1) {
                        results.push(val.isFile ? this.createFileEntry(val.name, val.fullPath, val.file) : this.createDirectoryEntry(val.name, val.fullPath))
                    }
                }
                cursor['continue']()
            }
        }).then(() => results)
    }

    protected toURL(entry: FileEntry) {
        this.checkEntry(entry)
        if (entry.file && entry.file.blob) {
            return URL.createObjectURL(entry.file.blob)
        }
        return undefined
    }

    protected readFile(entry: FileEntry, method: ReadMethod, ...args: any[]) {
        this.checkEntry(entry)
        if (entry.file && entry.file.blob) {
            return readFile(entry.file.blob, method, ...args)
        }
        return undefined
    }

    getBlob(entry: FileEntry) {
        this.checkEntry(entry)
        if (entry.file && entry.file.blob) {
            return entry.file.blob
        }
        return undefined
    }

    /**
     * 检查Entry
     * @param {*Entry} entry 
     */
    protected checkEntry(entry: Entry) {
        if (!entry || !(entry instanceof Entry)) {
            throw new FileError(FILE_ERROR.NOT_ENTRY)
        }
    }

    /**
     * 
     * @param {Entry} entry 
     * @param {path} path 
     */
    protected ensureDirectory(entry: DirectoryEntry, path: string) {
        this.checkEntry(entry)
        if (path === DIR_SEPARATOR) {
            // 如果获取'/'直接返回当前目录
            return entry
        }
        const rPath = resolveToFullPath(entry.fullPath, path)
        if (rPath.length < path.length) {
            return entry
        }
        path = rPath.substring(entry.fullPath.length)
        const dirs = path.split(DIR_SEPARATOR)
        return promiseForEach(dirs, (dir: string, index: number) => {
            return entry.getDirectory(dirs.slice(0, index + 1).join('/'), { create: true })
        }, true).then((dirEntries) => {
            return dirEntries && dirEntries[dirEntries.length - 1]
        }).catch(err => { throw err })
    }

    protected async renameFile(entry: FileEntry, newName: string) {
        const dir = await entry.getParent();
        const file = await dir.getFile(newName, { create: false, exclusive: true });
        if (file) throw new Error(`${FILE_ERROR.FILE_EXISTED}: ${newName}`);

        await entry.remove();
        const newEntry = await dir.getFile(newName);
        await newEntry.write(entry.file.blob);
        return newEntry
    }
}
