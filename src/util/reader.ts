
export type ReadMethod = "readAsArrayBuffer" | "readAsBinaryString" | "readAsDataURL" | "readAsText";

export function readFile(blob: Blob, method: ReadMethod, ...args: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        const params = [blob, ...args];     
                
        // @ts-ignore
        reader[method].apply(reader, params);
        reader.onload = function () {
            return resolve(reader.result)
        }
        reader.onerror = function (err) {
            return reject(err)
        }
        reader.onabort = function () {
            return reject(new Error('读取被中断'))
        }
    })
}


export function readAsArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
    return readFile(blob, 'readAsArrayBuffer')
}

export function readAsBinaryString(blob: Blob): Promise<string>  {
    return readFile(blob, 'readAsBinaryString')
}

export function readAsDataURL(blob: Blob): Promise<string> {
    return readFile(blob, 'readAsDataURL')
}

export function readAsText(blob: Blob, encoding: string = 'gb2312') : Promise<string> {
    return readFile(blob, 'readAsText', encoding)
}