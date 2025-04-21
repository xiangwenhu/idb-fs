import { IDB_FILE_STORE_NAME, IDB_INFO_STORE_NAME } from "../const/index";

interface Options {
    dbVersion: number;
    dbName: string;
}


export function getDatabase(options: Options): Promise<IDBDatabase> {
    const { dbVersion, dbName } = options;

    const infoStoreName = IDB_INFO_STORE_NAME;
    const fileStoreName = IDB_FILE_STORE_NAME;

    return new Promise((resolve, reject) => {
        const request = self.indexedDB.open(dbName, dbVersion)
        request.onerror = (event) => {
            return reject(event)
        }
        request.onsuccess = () => {
            const db = request.result;
            if (db.objectStoreNames.contains(infoStoreName) && db.objectStoreNames.contains(fileStoreName)) {
                return resolve(db)
            }
            reject(new Error("初始化database失败"))
        }
        request.onupgradeneeded = event => {
            const db = (event.target! as any).result as IDBDatabase;
            if (!db.objectStoreNames.contains(infoStoreName)) {
                const store = db.createObjectStore(infoStoreName, {
                    keyPath: ['parentPath', 'name'], // 复合主键
                    autoIncrement: false
                });
                // 创建索引（优化高频查询）
                store.createIndex('parentPath', 'parentPath', { unique: false }); // 按父路径快速筛选
                store.createIndex('kind', 'kind', { unique: false });              // 按类型分类
            }

            if (!db.objectStoreNames.contains(fileStoreName)) {
                db.createObjectStore(fileStoreName)
            }
        }
    })
}
