export function getDatabaseWithStore(dbVersion: number = 1.0, dbName: string, storeName: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = self.indexedDB.open(dbName, dbVersion)
        request.onerror = (event) => {
            return reject(event)
        }
        request.onsuccess = () => {
            const db = request.result;
            if (db.objectStoreNames.contains(storeName)) {
                return resolve(db)
            }
            reject(new Error("初始化database失败"))
        }
        request.onupgradeneeded = event => {
            const db = (event.target! as any).result as IDBDatabase;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName)
            }
        }
    })
}