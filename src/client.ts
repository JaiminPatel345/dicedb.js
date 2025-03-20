import net from 'net'

import type {
    DiceConnectionOptions,
    DiceResponse,
    ExpireOptions,
    GetExOptions,
    QueueItem,
    SetOptions,
} from './types.js'

import { DiceCommandErr, DiceConnectionErr, DiceError } from './errors.js'
import {
    cmdDecr,
    cmdDel,
    cmdExists,
    cmdExpire,
    cmdExpireTime,
    cmdFlush,
    cmdGet,
    cmdGetEx,
    cmdIncr,
    cmdSet,
    cmdTTL,
    cmdType,
} from './command.js'
import { generateID } from './utils.js'
import { deserializeResponse, serialize } from './protocol.js'
import DiceWatch from './watch.js'

class Dice {
    // Private properties
    private host: string // The host address to connect to (e.g., IP or domain)
    private port: number // The port number to connect to.
    private socket: net.Socket // The socket instance for network communication .
    private queue: QueueItem[] // A queue to for managing commands.
    private reconnectAttempts: number = 0
    private maxReconnectAttempts: number = 5
    private reconnectDelay: number = 1000
    private handshakeCompleted: boolean = false
    private isGracefullClose: boolean = false
    constructor(options: DiceConnectionOptions) {
        this.host = options.host
        this.port = options.port
        this.socket = new net.Socket()
        this.queue = []

        this.handleIncoming = this.handleIncoming.bind(this)

        this.socket.on('data', data => {
            // console.log(`Queue length : `, this.queue.length)
            this.handleIncoming(data)
        })

        this.socket.on('close', () => {
            if (this.handshakeCompleted && !this.isGracefullClose) {
                this.handleDisconnect() // If handshake is completed and somehow disconnected from the server
            }
        })

        this.socket.on('error', err => {
            if (this.handshakeCompleted) {
                this.handleError(err) // If handshake is completed and somehow disconnected from the server
            }
        })
    }

    private enqueue(item: QueueItem) {
        this.queue.push(item)
    }

    private dequeue() {
        this.queue.pop()
    }

    private handleError(err: Error) {
        this.close()
        throw new DiceError(
            `Something went wrong and connection closed: ${err.message}`,
        )
    }

    private handleDisconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            throw new DiceConnectionErr(
                `Failed to reconnect after ${this.maxReconnectAttempts} tries`,
            )
        }

        setTimeout(() => {
            this.reconnectAttempts++
            this.connect()
        }, this.reconnectDelay)

        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30 * 1000)
    }

    private handleIncoming(buffer: Buffer) {
        // console.log("Handling Queue Length : ", this.queue)
        if (this.queue.length) {
            const [resolve, reject] = this.queue.shift()!
            // console.log("Removed Queue Length : ", this.queue)

            const data = deserializeResponse(buffer)

            if (data.response.getErr()) {
                reject(new DiceCommandErr(data.response.getErr()))
            } else {
                resolve(data)
            }
        }
    }

    /**
     *  This function is used to connect to DiceDB server in command mode.
     *  It takes care of handshake & client id which requires to establish a connection to DiceDB.
     *
     *  @example
     *  // Example 1: Connecting to a DiceDB server
     *  const options = {
     *      host: "127.0.0.1",
     *      port: 7379
     *  }
     *
     *  const dice = new Dice(options);
     *  dice.connect();
     *
     *  @example
     *  // Handling connection errors
     *  try{
     *      const dice = new Dice(options);
     *      dice.connect();
     *  } catch(err) {
     *      console.error("Connection Failed: ", error.message);
     *  }
     */
    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.socket.connect({ port: this.port, host: this.host })

            this.socket.once('connect', () => {
                const handshake = serialize(
                    'HANDSHAKE',
                    generateID(),
                    'command',
                )
                this.socket.write(handshake)

                const handshakeTimeout = setTimeout(() => {
                    reject(
                        new DiceConnectionErr(
                            'Handshake timedout after 30000ms',
                        ),
                    )
                    this.close()
                }, 30 * 1000)

                this.socket.once('data', data => {
                    clearTimeout(handshakeTimeout)
                    const ack = data.toString('utf-8')

                    if (ack.includes('OK')) {
                        this.handshakeCompleted = true
                        resolve()
                    } else {
                        this.socket.end()
                        reject(
                            new DiceConnectionErr(
                                `Handshake responds with unexpected response: ${ack}`,
                            ),
                        )
                    }
                })
            })

            this.socket.once('error', err => {
                this.socket.end()
                reject(
                    new DiceConnectionErr(`Failed to connect: ${err.message}`),
                )
            })
        })
    }

    /**
     * This function is used to put or update an existing key.
     * You can set expiration and other options as well.
     *
     *  SET Identifies the type of the value based on the value itself. If the value is an integer, it will be stored as an integer. Otherwise, it will be stored as a string.
     * @example
     * // A Simple set example
     * const resp = await dice.set("foo", "bar")
     *
     * @example
     * // With Options
     * const resp = await dice.set("foo", "bar", {
     *      expiresSec: 1000, // It will expire in 1000 seconds.
     *      expiresMs: 1000, // It will expire in 1000 miliseconds.
     * })
     *
     */
    set(key: string, value: string, options?: SetOptions) {
        return cmdSet({
            conn: this.socket,
            dequeue: this.dequeue.bind(this),
            enqueue: this.enqueue.bind(this),
            key: key,
            value: value,
            options: options,
        })
    }

    /**
     * This function is used to get the value for a key.
     * The function returns (nil) as `ack` if the key does not exist.
     *
     * @example
     * const resp = await dice.get("foo")
     * console.log(resp.ack) // ouputs with : baar
     */
    get(key: string) {
        return cmdGet({
            conn: this.socket,
            dequeue: this.dequeue.bind(this),
            enqueue: this.enqueue.bind(this),
            key: key,
        })
    }

    /**
     * This function is used to get the value and immediately delete the provided key.
     * The function returns (nil) as `ack` if the key does not exist.
     *
     * @example
     * const resp = await dice.getdel("foo")
     * console.log(resp.ack) // ouputs with : baar
     */
    getdel(key: string) {
        return cmdGet(
            {
                conn: this.socket,
                dequeue: this.dequeue.bind(this),
                enqueue: this.enqueue.bind(this),
                key: key,
            },
            true,
        ) // Passing true will get the key and delete.
    }

    /**
     * This function is used to get the value and to set the expiration for given key.
     * The function returns (nil) as `ack` if the key does not exist.
     *
     * @example
     * const resp = await dice.getex("foo", {expiresSec: 10 // expires in 10 second})
     * console.log(resp.ack) // ouputs with : baar
     */
    getex(key: string, opts: GetExOptions) {
        return cmdGetEx({
            conn: this.socket,
            dequeue: this.dequeue.bind(this),
            enqueue: this.enqueue.bind(this),
            key: key,
            options: opts,
        })
    }

    /**
     * This function is used to decrement the value for given key.
     * It takes `value` as a parameter and decrement the key by that value.
     * Creates ‘key’ as -1 if absent. Errors on wrong type or non-integer string. Limited to 64-bit signed integers.
     *
     * @example
     * // Decrements by 1
     * const resp = await dice.decr("foo")
     * console.log(resp.ack) // ouputs with : -1
     *
     * @example
     * // Decrements by value
     * const resp = await dice.decr("foo", 5)
     * console.log(resp.ack) // ouputs with : -5
     */
    decr(key: string, value?: number) {
        return cmdDecr({
            conn: this.socket,
            enqueue: this.enqueue.bind(this),
            dequeue: this.dequeue.bind(this),
            value: value,
            key: key,
        })
    }

    /**
     * This function is used to increment the value for given key.
     * It takes `value` as a parameter and increment the key by that value.
     * Creates ‘key’ as 1 if absent. Errors on wrong type or non-integer string. Limited to 64-bit signed integers.
     *
     * @example
     * // Increment by 1
     * const resp = await dice.incr("foo")
     * console.log(resp.ack) // ouputs with : 1
     *
     * @example
     * // Increment by value
     * const resp = await dice.incr("foo", 5)
     * console.log(resp.ack) // ouputs with : 5
     */
    incr(key: string, value?: number) {
        return cmdIncr({
            conn: this.socket,
            enqueue: this.enqueue.bind(this),
            dequeue: this.dequeue.bind(this),
            value: value,
            key: key,
        })
    }

    /**
     * This function is used to delete the provided keys and returns with number of keys deleted on success.
     *
     * @example
     * // Increment by 1
     * const resp = await dice.del("foo")
     * console.log(resp.ack) // ouputs with : 1
     */
    del(...keys: string[]) {
        return cmdDel({
            conn: this.socket,
            enqueue: this.enqueue.bind(this),
            dequeue: this.dequeue.bind(this),
            keys: keys,
        })
    }

    /**
     * This function is used to get number of keys which exists in db without modifying them.
     *
     * @example
     * // Increment by 1
     * const resp = await dice.exists("foo", "bar", "whoo")
     * // Only foo and bar is there in DiceDB.
     * console.log(resp.ack) // ouputs with : 2
     */
    exists(...keys: string[]) {
        return cmdExists({
            conn: this.socket,
            enqueue: this.enqueue.bind(this),
            dequeue: this.dequeue.bind(this),
            keys: keys,
        })
    }

    async watch(key: string) {
        const client = new DiceWatch({
            host: this.host,
            port: this.port,
        })

        await client.connect()
        await client.watch(key)
        return client
    }

    expire(key: string, second: number, opts?: ExpireOptions) {
        return cmdExpire({
            conn: this.socket,
            enqueue: this.enqueue.bind(this),
            dequeue: this.dequeue.bind(this),
            key: key,
            value: second,
            options: opts,
        })
    }

    expireTime(key: string) {
        return cmdExpireTime({
            conn: this.socket,
            dequeue: this.dequeue.bind(this),
            enqueue: this.enqueue.bind(this),
            key: key,
        })
    }

    flush() {
        return cmdFlush({
            conn: this.socket,
            enqueue: this.enqueue.bind(this),
            dequeue: this.dequeue.bind(this),
        })
    }

    ttl(key: string) {
        return cmdTTL({
            conn: this.socket,
            dequeue: this.dequeue.bind(this),
            enqueue: this.enqueue.bind(this),
            key: key,
        })
    }

    type(key: string) {
        return cmdType({
            conn: this.socket,
            dequeue: this.dequeue.bind(this),
            enqueue: this.enqueue.bind(this),
            key: key,
        })
    }

    close() {
        this.isGracefullClose = true
        this.socket.end()
    }
}

export default Dice
