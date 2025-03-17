import net from 'net'
import type {
    CommandExecutorOptions,
    CommandOptions,
    Commands,
    ExpireOptions,
    GetExOptions,
    SetOptions,
} from './types.js'
import { DiceCommandErr } from './errors.js'
import { serialize } from './protocol.js'

export function commandExec(opts: CommandExecutorOptions) {
    return new Promise((resolve, reject) => {
        opts.enqueue([resolve, reject])

        const command = serialize(opts.command, ...opts.args)
        writer(opts.conn, command, opts.command, opts.dequeue, reject)
    })
}

export function writer(
    con: net.Socket,
    buf: Uint8Array | string,
    action: Commands,
    dequeue: () => void,
    reject: (reason: any) => void,
) {
    return con.write(buf, cb => {
        if (cb) {
            dequeue()
            reject(
                new DiceCommandErr(
                    `Failed to perform ${action} : ${cb.message}`,
                ),
            )
        }
    })
}

export function setOptsToCommand(
    options?: Partial<Record<keyof SetOptions, any>>,
) {
    const command: Record<CommandOptions, any> = {} as any

    if (options?.expiresSec) {
        command['EX'] = options.expiresSec
    }

    if (options?.expiresMs) {
        command['PX'] = options.expiresMs
    }

    if (options?.expireAt) {
        command['EXAT'] = options.expireAt
    }

    if (options?.expireAtMs) {
        command['PXAT'] = options.expireAtMs
    }

    if (options?.onlyIfExists) {
        command['XX'] = ''
    }

    if (options?.onlyIfNotExists) {
        command['NX'] = ''
    }

    if (options?.keepTTL) {
        command['KEEPTTL'] = ''
    }

    if (options?.get) {
        command['GET'] = ''
    }

    return Object.entries(command).flat()
}

export function getExOptsToCommand(
    options?: Partial<Record<keyof GetExOptions, any>>,
) {
    const command: Record<CommandOptions, any> = {} as any

    if (options?.expiresSec) {
        command['EX'] = options?.expiresSec
    }

    if (options?.expiresMs) {
        command['PX'] = options?.expireAtMs
    }

    if (options?.expireAt) {
        command['EXAT'] = options?.expireAt
    }

    if (options?.expireAtMs) {
        command['PXAT'] = options?.expireAtMs
    }

    if (options?.persist) {
        command['PERSIST'] = ''
    }

    return Object.entries(command).flat()
}

export function expireOptsToCommand(options?: ExpireOptions) {
    const command: Record<CommandOptions, any> = {
        "NX": ""
    } as any;

    if(options?.onlyIfExists) {
        delete command["NX"]
        command["XX"] = ""
    }

    if(options?.gt) {
        delete command["LT"]
        command["GT"] = `${options?.gt}`
    }

    if (options?.lt) {
        delete command["GT"]
        command["LT"] = `${options?.lt}`
    }

    return Object.entries(command).flat()
}