export class FSFile {

    public lastModifiedTime = new Date();

    constructor(public name: string, public size: number, public type: string, public createTime: Date, public blob: Blob | undefined) {
        this.name = name;
        this.size = size;
        this.type = type;
        this.createTime = createTime;
        this.blob = blob;
    }
}