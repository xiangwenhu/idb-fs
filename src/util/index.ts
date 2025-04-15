import { DIR_SEPARATOR, PathBlackList } from "../const"

/**
 * https://segmentfault.com/q/1010000007499416
 * Promise for forEach
 * @param {*数组} arr 
 * @param {*回调} cb(val)返回的应该是Promise 
 * @param {*是否需要执行结果集} needResults
 */
export function promiseForEach(arr: any[], cb: Function, needResults: boolean) {
    const realResult: any[] = []
    let result = Promise.resolve()
    Array.from(arr).forEach((val, index) => {
        result = result.then(() => {
            return cb(val, index).then((res: any) => {
                needResults && realResult.push(res)
            })
        })
    })
    return needResults ? result.then(() => realResult) : result
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

export function isValidatedPath(path: string) {
    return PathBlackList.test(path) ? false : true
}

export function contentToBlob(content: any, type = 'text/plain') {
    let blob
    // 不是blob，转为blob
    if (content instanceof Blob) {
        blob = content
    } else if (content instanceof ArrayBuffer) {
        blob = new Blob([new Uint8Array(content)], { type })
    } else if (typeof content === 'string') {
        blob = new Blob([content], { type: 'text/plain' })
    } else {
        blob = new Blob([content], { type })
    }
    return blob
}