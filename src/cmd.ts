// GENERATED: DO NOT EDIT
// GENERATED: DO NOT EDIT
// GENERATED: DO NOT EDIT

import * as jspb from 'google-protobuf'
import * as google_protobuf_struct_pb from 'google-protobuf/google/protobuf/struct_pb.js'

export class Command extends jspb.Message {
    toObject(includeInstance?: boolean): {} {
        throw new Error('Method not implemented.')
    }
    private cmd: string
    private args: string[]

    constructor(cmd: string = '', args: string[] = []) {
        super()
        this.cmd = cmd
        this.args = args
    }

    getCmd(): string {
        return this.cmd
    }

    setCmd(value: string): void {
        this.cmd = value
    }

    getArgsList(): string[] {
        return this.args
    }

    setArgsList(value: string[]): void {
        this.args = value
    }

    addArgs(value: string, index?: number): void {
        if (index !== undefined) {
            this.args.splice(index, 0, value)
        } else {
            this.args.push(value)
        }
    }

    serializeBinary(): Uint8Array {
        const writer = new jspb.BinaryWriter()
        writer.writeString(1, this.cmd)
        writer.writeRepeatedString(2, this.args)
        return writer.getResultBuffer()
    }

    static deserializeBinary(bytes: Uint8Array): Command {
        const reader = new jspb.BinaryReader(bytes)
        let message = new Command()
        while (reader.nextField()) {
            if (reader.isEndGroup()) break
            switch (reader.getFieldNumber()) {
                case 1:
                    message.setCmd(reader.readString())
                    break
                case 2:
                    message.addArgs(reader.readString())
                    break
            }
        }
        return message
    }
}

export class Response extends jspb.Message {
    toObject(includeInstance?: boolean): {} {
        throw new Error('Method not implemented.')
    }
    private err: string
    private vNil?: boolean
    private vInt?: number
    private vStr?: string
    private vFloat?: number
    private vBytes?: Uint8Array
    private attrs?: google_protobuf_struct_pb.Struct
    private vList: google_protobuf_struct_pb.Value[] = []

    constructor(err: string = '') {
        super()
        this.err = err
    }

    getErr(): string {
        return this.err
    }

    setErr(value: string): void {
        this.err = value
    }

    setVNil(value: boolean): void {
        this.vNil = value
    }

    getVNil(): boolean | undefined {
        return this.vNil
    }

    setVInt(value: number): void {
        this.vInt = value
    }

    getVInt(): number | undefined {
        return this.vInt
    }

    setVStr(value: string): void {
        this.vStr = value
    }

    getVStr(): string | undefined {
        return this.vStr
    }

    setVFloat(value: number): void {
        this.vFloat = value
    }

    getVFloat(): number | undefined {
        return this.vFloat
    }

    setVBytes(value: Uint8Array): void {
        this.vBytes = value
    }

    getVBytes(): Uint8Array | undefined {
        return this.vBytes
    }

    setAttrs(value: google_protobuf_struct_pb.Struct): void {
        this.attrs = value
    }

    getAttrs(): google_protobuf_struct_pb.Struct | undefined {
        return this.attrs
    }

    addVList(value: google_protobuf_struct_pb.Value): void {
        this.vList.push(value)
    }

    getVListList(): google_protobuf_struct_pb.Value[] {
        return this.vList
    }

    serializeBinary(): Uint8Array {
        const writer = new jspb.BinaryWriter()
        writer.writeString(1, this.err)
        if (this.vNil !== undefined) writer.writeBool(2, this.vNil)
        if (this.vInt !== undefined) writer.writeInt64(3, this.vInt)
        if (this.vStr !== undefined) writer.writeString(4, this.vStr)
        if (this.vFloat !== undefined) writer.writeDouble(5, this.vFloat)
        if (this.vBytes !== undefined) writer.writeBytes(6, this.vBytes)
        if (this.attrs !== undefined)
            writer.writeMessage(
                7,
                this.attrs,
                google_protobuf_struct_pb.Struct.serializeBinaryToWriter,
            )
        this.vList.forEach(val =>
            writer.writeMessage(
                8,
                val,
                google_protobuf_struct_pb.Value.serializeBinaryToWriter,
            ),
        )
        return writer.getResultBuffer()
    }

    static deserializeBinary(bytes: Uint8Array): Response {
        const reader = new jspb.BinaryReader(bytes)
        let message = new Response()
        while (reader.nextField()) {
            if (reader.isEndGroup()) break
            switch (reader.getFieldNumber()) {
                case 1:
                    message.setErr(reader.readString())
                    break
                case 2:
                    message.setVNil(reader.readBool())
                    break
                case 3:
                    message.setVInt(reader.readInt64())
                    break
                case 4:
                    message.setVStr(reader.readString())
                    break
                case 5:
                    message.setVFloat(reader.readDouble())
                    break
                case 6:
                    message.setVBytes(reader.readBytes())
                    break
                case 7:
                    let struct = new google_protobuf_struct_pb.default.Struct()
                    reader.readMessage(
                        struct,
                        google_protobuf_struct_pb.default.Struct
                            .deserializeBinaryFromReader,
                    )
                    message.setAttrs(struct)

                    break
                case 8:

                    let value = new google_protobuf_struct_pb.default.Value()
                    reader.readMessage(
                        value,
                        google_protobuf_struct_pb.default?.Value
                            .deserializeBinaryFromReader,
                    )
                    message.addVList(value)
                    break
            }
        }
        return message
    }
}
