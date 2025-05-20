export type HandleKind = "file" | "directory";

export type TypedArray = Int8Array |
    Uint8Array |
    Uint8ClampedArray |
    Int16Array |
    Uint16Array |
    Int32Array |
    Uint32Array |
    // Float16Array |
    Float32Array |
    Float64Array;
// BigInt64Array |
// BigUint64Array;

export type WritableStreamDataType = ArrayBuffer | TypedArray | DataView | Blob | string;

export type WriteCommand = {
    type: "write" | "seek" | "truncate";
    data?: WritableStreamDataType;
    position?: number;
    size?: number;
};