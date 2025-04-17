
## 设计


### 设计图


### 存储
*  一个ObjectStore存基本信息，另外一个存Blob
*  存储Blob的ObjectStore的key是 uuid，通过uuid关联，这样文件重命名的时候，不涉及Blob的转存。
*  Blob 转 File
  

### API 
参考 [File System API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API), 核心实现

* FileSystemHandle
  * kind
  * name
  * isSameEntry()
  * remove()
* FileSystemFileHandle
  * createSyncAccessHandle() XX
  * createWritable() ??
  * getFile()
* FileSystemDirectoryHandle
  * entries()
  * getDirectoryHandle()
  * getFileHandle()
  * keys()
  * removeEntry()
  * resolve() ？？
  * values()
