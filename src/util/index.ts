import { DIR_SEPARATOR, REG_INVALID_DIRECTORY_NAME, REG_INVALID_FILE_NAME } from "../const/index"

export function isObject(obj: any) {
    return obj !== null && typeof obj === "object";
}

export function isString(str: any) {
    return typeof str === "string";
}


// from https://github.com/ebidel/idb.filesystem.js/blob/master/src/idb.filesystem.js
// When saving an entry, the fullPath should always lead with a slash and never
// end with one (e.g. a directory). Also, resolve '.' and '..' to an absolute
// one. This method ensures path is legit!
export function resolveToFullPath(cwdFullPath: string, path: string) {
    let fullPath = path

    const relativePath = path[0] != DIR_SEPARATOR
    if (relativePath) {
        fullPath = cwdFullPath + DIR_SEPARATOR + path
    }

    // Normalize '.'s,  '..'s and '//'s.
    const parts = fullPath.split(DIR_SEPARATOR)
    const finalParts = []
    for (let i = 0; i < parts.length; ++i) {
        const part = parts[i]
        if (part === '..') {
            // Go up one level.
            if (!finalParts.length) {
                throw Error('Invalid path')
            }
            finalParts.pop()
        } else if (part === '.') {
            // Skip over the current directory.
        } else if (part !== '') {
            // Eliminate sequences of '/'s as well as possible leading/trailing '/'s.
            finalParts.push(part)
        }
    }

    fullPath = DIR_SEPARATOR + finalParts.join(DIR_SEPARATOR)

    // fullPath is guaranteed to be normalized by construction at this point:
    // '.'s, '..'s, '//'s will never appear in it.

    return fullPath
}

/**
 * 校验文件名合法性
 * @param {string} filename - 待校验的文件名
 * @returns {boolean} 是否合法
 */
export function isValidFileName(filename: string): boolean {
    // 附加规则（
    return (
        // 基础正则匹配
        REG_INVALID_FILE_NAME.test(filename) &&
        // 长度限制
        filename.length <= 255 &&
        // 禁止仅扩展名（如 ".txt"）
        !/^\.+$/.test(filename) &&
        // 禁止连续点号（如 "file..txt"）
        !filename.includes('..')
    );
}

/**
* 校验目录名合法性（兼容 Windows/Linux 系统规则）
* @param {string} dirname - 待校验的目录名
* @returns {boolean} 是否合法
*/
export function isValidDirectoryName(dirname: string): boolean {

    // 综合校验条件（网页3/5/12）
    return (
        REG_INVALID_DIRECTORY_NAME.test(dirname) &&             // 正则匹配
        dirname.length <= 255 &&                                // 长度限制（
        !dirname.startsWith('.') &&                             // Linux下避免隐藏目录混淆
        !dirname.includes('..') &&                               // 防止路径遍历（网页7）
        !dirname.endsWith(' ')                                   // 结尾禁止空格（网页7）
    );
}

export function uuid(): string {
    return URL.createObjectURL(new Blob([])).split("/").pop()!
}

/**
 * 将键值对数组封装为异步迭代器
 * @param {Array} keyValueArray - 键值对数组
 * @param {number} delay - 模拟异步延迟（可选）
 */
export function createAsyncIterator<V = any>(keyValueArray: V[]) {
    return {
        async *[Symbol.asyncIterator]() {
            for (const item of keyValueArray) {
                await Promise.resolve(item);
                yield item; // 返回键值对对象
            }
        }
    };
}

export function createAsyncIteratorHoc<V = any>(valuesCreator: () => Promise<V[]> | V[]) {
    return {
        async *[Symbol.asyncIterator]() {
            const keyValueArray = await Promise.resolve(valuesCreator())
            for (const item of keyValueArray) {
                await Promise.resolve(item);
                yield item; // 返回键值对对象
            }
        }
    };
}

export function protectProperty(obj: Object, property: PropertyKey, value: any) {
    Object.defineProperty(obj, property, {
        enumerable: false,
        configurable: false,
        writable: false,
        value: isObject(value) ? Object.freeze(value) : value
    })
}

export function checkFilename(name: string) {
    if (!isString(name)) {
        throw new TypeError("name is not a valid string")
    }
    if (!isValidFileName(name)) {
        throw new TypeError("name contains invalid characters")
    }
}

export function checkDirectoryName(name: string) {
    if (!isString(name)) {
        throw new TypeError("name is not a valid string")
    }
    if (!isValidDirectoryName(name)) {
        throw new TypeError("name contains invalid characters")
    }
}