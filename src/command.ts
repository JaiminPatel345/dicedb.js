import type {
    CommandExecOptions,
    Commands,
    CommandSpecOpts,
    ExpireOptions,
    GetExOptions,
    SetOptions,
} from './types.js'
import {
    commandExec,
    expireOptsToCommand,
    getExOptsToCommand,
    setOptsToCommand,
} from './helpers.js'

type SetCommandOptions = CommandExecOptions & CommandSpecOpts<SetOptions>

export function cmdSet(options: SetCommandOptions) {
    const { key, value } = options
    const opts = setOptsToCommand(options.options)

    return commandExec({
        ...options,
        args: [key, value, ...opts],
        command: 'SET',
    })
}

export function cmdGet(
    options: Omit<CommandExecOptions, 'value'>,
    isDel?: boolean,
) {
    const { key } = options

    return commandExec({
        ...options,
        command: isDel ? 'GETDEL' : 'GET',
        args: [key],
    })
}

export function cmdGetEx(
    options: Omit<CommandExecOptions, 'value'> & CommandSpecOpts<GetExOptions>,
) {
    const { key } = options
    const opts = getExOptsToCommand(options.options)

    return commandExec({ ...options, command: 'GETEX', args: [key, ...opts] })
}

export function cmdDecr(options: Partial<CommandExecOptions>) {
    let cmd: Commands = 'DECR'
    const args: any[] = [options.key]
    const isValue = options?.value

    if (typeof isValue === 'number') {
        cmd = 'DECRBY'
        args.push(isValue)
    }

    return commandExec({ ...options, command: cmd, args })
}

export function cmdIncr(options: Partial<CommandExecOptions>) {
    let cmd: Commands = 'INCR'
    const args: any[] = [options.key]
    const isValue = options?.value

    if (typeof isValue === 'number') {
        cmd = 'INCRBY'
        args.push(isValue)
    }

    return commandExec({ ...options, command: cmd, args })
}

export function cmdDel(
    options: Omit<Partial<CommandExecOptions>, 'keys'> & { keys: string[] },
) {
    return commandExec({ ...options, command: 'DEL', args: options.keys })
}

export function cmdExists(
    options: Omit<Partial<CommandExecOptions>, 'keys'> & { keys: string[] },
) {
    return commandExec({ ...options, command: 'EXISTS', args: options.keys })
}

export function cmdExpire(
    options: Omit<Partial<CommandExecOptions>, 'value'> & {
        options: ExpireOptions
    },
) {
    const opts = expireOptsToCommand(options?.options)
    let cmd: Commands = opts?.length > 1 ? 'EXPIREAT' : 'EXPIRE'

    return commandExec({
        ...options,
        command: 'EXPIRE',
        args: [options.key, ...opts],
    })
}

export function cmdExpireTime(
    options: Omit<Partial<CommandExecOptions>, 'value'>,
) {
    return commandExec({
        ...options,
        command: 'EXPIRETIME',
        args: [options.key],
    })
}

export function cmdFlush(options: Partial<CommandExecOptions>) {
    return commandExec({
        ...options,
        command: 'FLUSHDB',
        args: [],
    })
}

export function cmdTTL(options: Partial<CommandExecOptions>) {
    return commandExec({
        ...options,
        command: 'TTL',
        args: [options.key],
    })
}

export function cmdType(options: Partial<CommandExecOptions>) {
    return commandExec({
        ...options,
        command: 'TYPE',
        args: [options?.key]
    })
}
