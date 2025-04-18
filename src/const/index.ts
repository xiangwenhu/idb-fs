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

export const REG_INVALID_DIRECTORY_NAME = new RegExp(
    // 禁止非法字符：\/:*?"<>| 和 ASCII控制字符（0-31）
    `^(?!^(CON|PRN|AUX|NUL|COM[0-9]|LPT[0-9])$)` +         // 排除保留名称（网页7/13）
    `[^\\\\/:*?\"<>|\\x00-\\x1F]` +                        // 排除非法字符和控制符
    `[^\\\\/:*?\"<>|]{0,253}` +                            // 中间允许非保留字符（长度限制）
    `[^\\\\/:*?\"<>|.]$`,                                  // 结尾禁止.或空格（网页7/12）
    'i' // 不区分大小写
);

export const REG_INVALID_FILE_NAME = /^(?!^(PRN|AUX|CLOCK\$|NUL|CON|COM[0-9]|LPT[0-9])(\..*)?$)[^\s\\\\/:*?\"<>|](?:[^\\\\/:*?\"<>|]*[^\s\\\\/:*?\"<>|.])?$/i;

export const NOT_SUPPORTED = new Error('浏览器不支持改功能');

export const IDB_DATABASE_PREFIX = "__idb_file_system__";

export const IDB_DEFAULT_DATABASE_NAME = "default";

export const IDB_INFO_STORE_NAME = "INFOS";

export const IDB_FILE_STORE_NAME = "FILES";

