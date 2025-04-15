import { Entry } from "./Entry"
import { FSFile } from "./FSFile"
import { contentToBlob } from "./util/index"

export class FileEntry extends Entry {
    constructor(name: string, fullPath: string, public file: FSFile) {
        super(true, false, name, fullPath)
        this.file = file
    }
    /**
     * FileEntry写入数据 done
     * @param {Blob|String|BufferArray} content 
     * @param {String} type 
     * @param {Boolean} append 
     */
    write(content: any, type = 'text/plain', append = false): Promise<void> {
        if (!append) {
            return this.dispatch('write', content, type, append)
        }
        return this.append(content)
    }

    append(content: any): Promise<void>  {
        return this.getBlob().then(blob => {
            return this.write(new Blob([blob, contentToBlob(content, blob.type)]))
        })
    }

    getBlob(): Promise<Blob> {
        return this.dispatch('getBlob')
    }

    readAsArrayBuffer(): Promise<string> {
        return this.dispatch('readFile', 'readAsArrayBuffer')
    }

    readAsBinaryString(): Promise<string>  {
        return this.dispatch('readFile', 'readAsBinaryString')
    }

    readAsDataURL(): Promise<string>  {
        return this.dispatch('readFile', 'readAsDataURL')
    }

    readAsText(encoding = 'utf-8'): Promise<string>  {
        return this.dispatch('readFile', 'readAsText', encoding)
    }
}