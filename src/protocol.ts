import { Command, Response } from './cmd.js'
import { DiceError } from './errors.js'
import { Commands } from './types.js'

export function serialize(command: Commands, ...args: string[]) {

    const cmd = new Command(
        command,
        args?.map(arg => `${arg}`),
    )


    return cmd.serializeBinary()
}

export function deserializeResponse(buffer: Buffer) {
    if (buffer.length === 0) {
        throw new DiceError('Server responded with nil buffers')
    }

    const response = Response.deserializeBinary(new Uint8Array(buffer))
    const data =
        response.getVStr() || response.getVInt() || response.getVFloat()

    return {
        ack: data,
        response: response,
    }
}
