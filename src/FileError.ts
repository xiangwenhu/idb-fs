export class FileError extends Error {
    public type: string = "FileError";
    constructor(public message: string) {
        super(message)
    }
}
