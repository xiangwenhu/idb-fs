import { IDBFileSystemDirectoryHandle } from "./IDBFileSystemDirectoryHandle"
import StoreProvider from "./provider/index";


export default class IDBFileSystem {
    public root: IDBFileSystemDirectoryHandle;

    constructor(private storeProvider: StoreProvider) {
        this.root = this.storeProvider.directory.toDirectoryHandle("/", "/")
    }
}