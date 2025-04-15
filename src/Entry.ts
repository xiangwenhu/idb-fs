import { NOT_IMPLEMENTED_ERROR } from "./const";
import { IDirectoryEntry } from "./types";

export class Entry {

    public metadata: Metadata;

    private __provider__!: any;

    constructor(public isFile: boolean = true, public isDirectory = false, public name: string, public fullPath: string) {
        this.isFile = isFile
        this.isDirectory = isDirectory
        this.name = name
        this.fullPath = fullPath
        this.metadata = {
            lastModifiedDate: new Date(),
            size: 0
        }
    }

    /**
     * 获取元数据 done
     */
    getMetadata(): Promise<Metadata> {
        return this.dispatch('getMetadata')
    }

    moveTo() {
        throw NOT_IMPLEMENTED_ERROR
        //this._dispatch('moveTo', [...arguments])
    }

    copyTo() {
        throw NOT_IMPLEMENTED_ERROR
        // this._dispatch('copyTo', [...arguments])
    }

    toURL(): Promise<string> {
        return this.dispatch('toURL')
    }

    /**
     * 删除  done
     */
    remove(): Promise<void> {
        return this.dispatch('remove')
    }

    /**
     * 获得父目录 done
     */
    getParent(): Promise<IDirectoryEntry> {
        return this.dispatch('getParent')
    }


    protected dispatch<R = any>(method: string, ...args: any[]): Promise<R> {
        return new Promise(resolve => {
            // @ts-ignore
            return resolve(this.__provider__[method](this, ...args))
        })
    }

}


