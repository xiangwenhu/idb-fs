import { IDBStoreBaseItem, IDBStoreFileItem, IDBStoreInfoDirectoryItem, IDBStoreInfoFileItem } from "../types";
import { DirectoryProvider } from "./DirectoryProvider";
import FileProvider from "./FileProvider";
import ObjectStore from "./ObjectStore";

export default class StoreProvider {

    public file: FileProvider;
    public directory: DirectoryProvider;

    constructor(
        protected infoStore: ObjectStore<string, IDBStoreInfoFileItem | IDBStoreInfoDirectoryItem>,
        protected fileStore: ObjectStore<string, IDBStoreFileItem>
    ) {
        this.file = new FileProvider(infoStore, fileStore);
        this.directory = new DirectoryProvider(infoStore, fileStore, this.file);
    }

}