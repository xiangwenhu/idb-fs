import { FILE_ERROR } from "./const"
import { Entry } from "./Entry"
import { IDirectoryEntry, IFileEntry, OpOptions } from "./types"
import { isValidatedPath } from "./util/index"

export class DirectoryEntry extends Entry {
    constructor(name: string, fullPath: string) {
        super(false,  name, fullPath)
    }

    /**
     * 获取文件 done
     * @param {String} path 路径
     * @param {Object} options  create:是否创建 ， exclusive 排他
     */
    getFile(path: string, options = { create: true, exclusive: false }): Promise<IFileEntry> {
        if (!isValidatedPath(path)) {
            return Promise.reject(FILE_ERROR.INVALID_PATH)
        }
        return this.dispatch('getFile', path, options)
    }

    /**
     * 获取目录 done
     * @param {String} path 
     * @param {Object} options 
     */
    getDirectory(path: string, options: OpOptions = { create: true, exclusive: false }): Promise<IDirectoryEntry> {
        if (!isValidatedPath(path)) {
            return Promise.reject(FILE_ERROR.INVALID_PATH)
        }
        return this.dispatch('getDirectory', path, options)
    }

    /**
     * 递归删除 done
     */
    remove(): Promise<void> {
        return this.dispatch('removeRecursively')
    }

    /**
     * 获取目录下的目录和文件
     */
    getEntries(): Promise<(IFileEntry | IDirectoryEntry)[]> {
        return this.dispatch('getEntries')
    }

    ensureDirectory(path: string): Promise<IDirectoryEntry> {
        return this.dispatch('ensureDirectory', path)
    }
}