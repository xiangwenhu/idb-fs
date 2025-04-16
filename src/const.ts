import { FileError } from "./FileError";

export const FILE_ERROR = {
    INITIALIZE_FAILED: '文件系统初始化失败',
    FILE_EXISTED: '文件已存在',
    Directory_EXISTED: '目录已存在',
    ONLY_FILE_WRITE: '只有文件才能写入',
    NOT_ENTRY: '不是有效的Entry对象',
    INVALID_PATH: '文件或者目录不能包含\\/:*?"<>|'
};

export const DIR_SEPARATOR = '/';
export const DIR_OPEN_BOUND = String.fromCharCode(DIR_SEPARATOR.charCodeAt(0) + 1);

export const PathBlackList = /[\\:*?"<>|]/;

export const NOT_IMPLEMENTED_ERROR = new FileError('方法未实现');

export const NOT_SUPPORTED = new Error('浏览器不支持改功能');


export const IDB_DATABASE_PREFIX = "__idb_file_system__";

export const IDB_DEFAULT_DATABASE_NAME = "default";

export const IDB_DEFAULT_STORE_NAME = "FILES";