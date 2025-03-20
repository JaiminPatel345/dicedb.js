import net from 'net'

import { DiceConnectionOptions } from './types.js'

import { deserializeResponse, serialize } from './protocol.js'
import { DiceCommandErr, DiceConnectionErr, DiceError } from './errors.js'
import EventEmitter from 'events'

interface WatchEvents {
    data: string | number
    error: Error
}

class DiceWatch extends EventEmitter {
    private host: string
    private port: number
    private socket: net.Socket
    private id: string
    private isHandshakeCompleted = false
    private isWatching = false
    private key = ''
    private fignerprint = ''
    private reconnectAttempts: number = 0
    private maxReconnectAttempts: number = 5
    private reconnectDelay: number = 1000
    private isGracefullClose: boolean = false
    constructor(options: DiceConnectionOptions & { key?: string }) {
        super()
        this.host = options.host
        this.port = options.port
        this.socket = new net.Socket()
        this.key = options?.key

        this.socket.on('data', buffer => {
            if (this.isHandshakeCompleted && this.isWatching) {
                const data = deserializeResponse(buffer)
                const jsonData = JSON.parse(JSON.stringify(data))
                this.fignerprint =
                    jsonData['response']['attrs']['f']['1']['a']['fingerprint'][
                        'value'
                    ][2]
                super.emit('data', data.ack)
            }
        })

        this.socket.on('error', err => {
            if (this.isHandshakeCompleted && this.isWatching) {
                this.handleError(err)
            }
        })

        this.socket.on('close', err => {
            if (
                this.isWatching &&
                this.isHandshakeCompleted &&
                !this.isGracefullClose
            ) {
                this.handleDisconnect()
            }

            this.removeAllListeners()
        })
    }

    on<K extends keyof WatchEvents>(
        event: K,
        lisenter: (arg: WatchEvents[K]) => void,
    ) {
        return super.on(event, lisenter)
    }

    emit<K extends keyof WatchEvents>(event: K, ...args: [WatchEvents[K]]) {
        return super.emit(event, ...args)
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.socket.connect({ host: this.host, port: this.port })

            this.socket.once('connect', () => {
                const handshake = serialize('HANDSHAKE', this.id, 'watch')

                this.socket.write(handshake)

                const handshakeTimeout = setTimeout(() => {
                    this.close()
                    reject(
                        new DiceConnectionErr(
                            'Handshake timedout after 30000ms',
                        ),
                    )
                }, 30000)

                this.socket.once('data', buffer => {
                    clearTimeout(handshakeTimeout)
                    const ack = buffer.toString('utf-8')

                    if (ack.includes('OK')) {
                        this.isHandshakeCompleted = true
                        resolve('')
                    } else {
                        this.socket.end()
                        reject(
                            new DiceConnectionErr(`Handshake failed: ${ack}`),
                        )
                    }
                })

                this.socket.once('error', err => {
                    this.socket.end()
                    reject(
                        new DiceConnectionErr(
                            `Failed to connect: ${err.message}`,
                        ),
                    )
                })
            })
        })
    }

    watch(key = this.key) {
        if (!key) {
            throw new DiceError(
                `Missing Key. Key is required when calling watch()`,
            )
        }

        const buf = serialize('GET.WATCH', key)

        return new Promise((resolve, reject) => {
            this.socket.write(buf, cb => {
                if (cb) {
                    reject(
                        new DiceCommandErr(
                            `Failed to perform GET.WATCH : ${cb.message}`,
                        ),
                    )
                }
            })
            this.isWatching = true
            resolve('')
        })
    }

    private unwatch() {
        return new Promise((resolve, reject) => {
            if (this.isWatching) {
                const buf = serialize('UNWATCH', this.fignerprint)

                this.socket.write(buf, cb => {
                    if (cb) {
                        reject(
                            new DiceCommandErr(
                                `Failed to perform UNWATCH : ${cb.message}`,
                            ),
                        )
                    }
                })
                this.removeAllListeners()
                this.isHandshakeCompleted = false
                this.isWatching = false
                resolve('')
            } else {
                resolve('')
            }
        })
    }

    private handleDisconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            throw new DiceConnectionErr(
                `Failed to reconnect after ${this.maxReconnectAttempts} tries`,
            )
        }

        setTimeout(async () => {
            this.reconnectAttempts++
            await this.connect()
        }, this.reconnectDelay)

        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30 * 1000)
    }

    private handleError(err: Error) {
        this.close()
        this.emit(
            'error',
            new DiceError(
                `Something went wrong and connection closed: ${err.message}`,
            ),
        )
    }

    close() {
        return new Promise(async resolve => {
            this.isGracefullClose = true
            await this.unwatch() // This will unsubscribe from the watch if any exists
            this.socket.end()
            resolve(true)
        })
    }
}

export default DiceWatch
