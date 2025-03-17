import { Command, Response } from "./cmd.js"
import { Commands } from "./types.js"

export function serialize(command: Commands, ...args: string[]) {
    const cmd = new Command(
        command,
        args?.map(arg => `${args}`),
    )

    return cmd.serializeBinary()
}

export function deserializeResponse(buffer: Buffer) {
    if (buffer.length === 0) {
        return { success: false, ack: '', isNil: true }
    }

    const response = Response.deserializeBinary(new Uint8Array(buffer))
    const data = response.getVStr()

    return {
        ack: data,
        response: response,
    }
}