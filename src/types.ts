import net from 'net'
import { Response } from './cmd'

export interface DiceConnectionOptions {
    host: string
    port: number
}

export type QueueItem = [(val: any) => void, (val: any) => void]

export type Commands =
    | 'DECR'
    | 'DECRBY'
    | 'DEL'
    | 'ECHO'
    | 'EXISTS'
    | 'EXPIRE'
    | 'EXPIREAT'
    | 'EXPIRETIME'
    | 'FLUSHDB'
    | 'GET'
    | 'GETDEL'
    | 'GETEX'
    | 'GET.WATCH'
    | 'HANDSHAKE'
    | 'INCR'
    | 'INCRBY'
    | 'SET'
    | 'TTL'
    | 'TYPE'
    | 'UNWATCH'
    | 'PING'

export type CommandOptions =
    | 'EX'
    | 'PX'
    | 'EXAT'
    | 'PXAT'
    | 'XX'
    | 'NX'
    | 'KEEPTTL'
    | 'GET'
    | 'PERSIST'
    | 'GT'
    | 'LT'

export interface CommandExecutorOptions
    extends Omit<Partial<CommandExecOptions>, 'value'> {
    command: Commands
    args?: string[]
}

export interface CommandExecOptions {
    conn: net.Socket
    enqueue: (val: QueueItem) => void
    dequeue: () => void
    key: string
    value: string | number
}

export interface CommandSpecOpts<T extends object> {
    options?: T
}

export interface SetOptions {
    sec?: number // Set the expiration time in seconds
    ms?: number // Set the expiration time in milliseconds
    expireAt?: number // Set the expiration time in seconds since epoch
    expireAtMs?: number // Set the expiration time in milliseconds since epoch
    ifExists?: boolean // Only set the key if it already exists
    ifNotExists?: boolean // Only set the key if it does not already exist
    keepTTL?: boolean // Keep the existing TTL of the key
    get?: boolean // Return the value of the key after setting it
}

export interface GetExOptions {
    sec?: number // Set the expiration time in seconds
    ms?: number // Set the expiration time in milliseconds
    expireAt?: number // Set the expiration time in seconds since epoch
    expireAtMs: number // Set the expiration time in milliseconds since epoch
    persist?: boolean // Remove the expiration from the key.
}

export interface ExpireOptions {
    ifExists?: boolean // Set the expiration only if the key already has an expiration time.
    gt?: number // Set the expiration only if the key already has an expiration time and the new expiration time is greater than the current expiration time.
    lt?: number // Set the expiration only if the key already has an expiration time and the new expiration time is less than the current expiration time.
}

export interface DiceResponse {
    ack: string
    response: Response
}
