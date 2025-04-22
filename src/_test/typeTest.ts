


; (async function () {
    // @ts-ignore
    const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();

    dirHandle.entries();
    dirHandle.getDirectoryHandle("x", {create: true});
    dirHandle.getFileHandle("x", {});
    dirHandle.isSameEntry( {} as any);
    dirHandle.keys();
    dirHandle.removeEntry("x", {recursive: true});
    dirHandle.resolve({} as any);
    dirHandle.values();


    const fileHandle = await dirHandle.getFileHandle("");
    fileHandle.createWritable().then(w => w.getWriter());
    fileHandle.getFile();

    
})();

