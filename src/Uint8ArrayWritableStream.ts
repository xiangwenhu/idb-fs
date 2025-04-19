type WriteCommand = {
    type: "write" | "seek" | "truncate";
    data?: Blob | ArrayBuffer | string;
    position?: number;
    size?: number;
};

interface Uint8ArrayWritableStreamOptions {
    onClose?(): Promise<void>;
    onStart?(): Promise<any>;
    onAbort?(): Promise<void>;
    onWrite?(): Promise<void>
}

export default class Uint8ArrayWritableStream extends WritableStream<Blob | ArrayBuffer | string | WriteCommand> {

    private cursor = 0;
    private closed = false;
    private eventTarget = new EventTarget(); // 事件派发器

    constructor(private buffer: Uint8Array, private options?: Uint8ArrayWritableStreamOptions) {

        const sink: UnderlyingSink = {
            start: async () => {
                if (options?.onStart) {
                    await options.onStart();
                }
                return true; // 等待初始化完成
            },
            write: async (chunk) => {
                if (this.closed) throw new DOMException("Stream closed", "InvalidStateError");
                if (this.options?.onWrite) {
                    await this.options.onWrite();
                }
                await this.processChunk(chunk);
            },
            close: async () => {
                if (options?.onClose) {
                    await options.onClose();
                }

                this.closed = true;
                this.dispatchCloseEvent();
            },
            abort: async (reason) => {
                if (this.options?.onAbort) {
                    await this.options.onAbort();
                }
                this.closed = true;
                console.error("Aborted:", reason);
            }
        };
        super(sink);
    }

    private async processChunk(chunk: any): Promise<void> {
        const params = this.normalizeChunk(chunk);

        switch (params.type) {
            case 'write':
                await this.handleWrite(params.data!, params.position);
                break;
            case 'seek':
                this.handleSeek(params.position!);
                break;
            case 'truncate':
                this.handleTruncate(params.size!);
                break;
            default:
                throw new DOMException("Invalid operation", "NotSupportedError");
        }
    }

    private normalizeChunk(chunk: any): WriteCommand {
        if (chunk instanceof Blob || chunk instanceof ArrayBuffer || typeof chunk === 'string') {
            return { type: 'write', data: chunk };
        }
        return chunk;
    }

    private async handleWrite(data: Blob | ArrayBuffer | string, position?: number): Promise<void> {
        const pos = position ?? this.cursor;
        const uint8Data = await this.convertToUint8Array(data);

        if (pos + uint8Data.length > this.buffer.length) {
            this.expandBuffer(pos + uint8Data.length);
        }

        this.buffer.set(uint8Data, pos);
        this.cursor = pos + uint8Data.length;
    }

    private async convertToUint8Array(data: Blob | ArrayBuffer | string): Promise<Uint8Array> {
        if (typeof data === 'string') {
            return new TextEncoder().encode(data);
        }
        if (data instanceof Blob) {
            return new Uint8Array(await data.arrayBuffer());
        }
        return new Uint8Array(data);
    }

    private expandBuffer(newSize: number): void {
        const newBuffer = new Uint8Array(newSize);
        newBuffer.set(this.buffer);
        this.buffer = newBuffer;
    }

    private handleSeek(position: number): void {
        if (position < 0 || position > this.buffer.length) {
            throw new DOMException("Invalid position", "InvalidStateError");
        }
        this.cursor = position;
    }

    private handleTruncate(size: number): void {
        if (size < 0) throw new DOMException("Invalid size", "InvalidStateError");
        const newBuffer = new Uint8Array(size);
        newBuffer.set(this.buffer.subarray(0, size));
        this.buffer = newBuffer;
        this.cursor = Math.min(this.cursor, size);
    }

    public override async close(): Promise<void> {
        if (!this.closed) await super.close();
        return Promise.resolve(void 0);
    }

    getResult() {
        return this.buffer;
    }


    addEventListener(type: 'close', listener: () => void, options?: AddEventListenerOptions | boolean): void {
        this.eventTarget.addEventListener(type, listener, options);
    }

    removeEventListener(type: 'close', listener: () => void, options?: EventListenerOptions | boolean): void {
        this.eventTarget.removeEventListener(type, listener, options);
    }

    private dispatchCloseEvent(): void {
        const event = new Event('close');
        this.eventTarget.dispatchEvent(event);
    }
}

