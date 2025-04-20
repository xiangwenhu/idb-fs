import { ErrorCodeMap } from "../const/error";

// 生成 DOMException 的完整方法
export function createDOMException(code: number, message?: string) {
    let errInfo = (ErrorCodeMap[code] || { code: 'UnknownError', message: 'An unknown error occurred' });
    return new DOMException(message || errInfo.message, errInfo.code);
}