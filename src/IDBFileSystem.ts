import { DirectoryEntry } from "./DirectoryEntry"
import IndexedDBProvider from "./IndexedDBProvider"

export default class IDBFileSystem {

    public root: DirectoryEntry;

    constructor(private provider: IndexedDBProvider) {
        this.root = provider.root;
    }
}