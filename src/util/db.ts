export function getDatabaseWithStore(dbVersion: number = 1.0, dbName: string, storeNames: string | string[]): Promise<IDBDatabase> {

    const sNames = Array.isArray(storeNames) ? storeNames : [storeNames];

    return new Promise((resolve, reject) => {
        const request = self.indexedDB.open(dbName, dbVersion)
        request.onerror = (event) => {
            return reject(event)
        }
        request.onsuccess = () => {
            const db = request.result;
            if (sNames.every(name => db.objectStoreNames.contains(name))) {
                return resolve(db)
            }
            reject(new Error("初始化database失败"))
        }
        request.onupgradeneeded = event => {
            const db = (event.target! as any).result as IDBDatabase;
            sNames.forEach(name => {
                if (!db.objectStoreNames.contains(name)) {
                    db.createObjectStore(name)
                }
            })
        }
    })
}