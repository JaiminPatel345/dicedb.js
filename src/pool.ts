import Dice from './client.js'
import type { DiceConnectionOptions } from './types.js'

class DicePool {
    private pool: Dice[]
    private nextIndex = 0

    constructor(
        poolSize: number,
        options: DiceConnectionOptions
    ) {
        this.pool = Array.from(
            { length: poolSize },
            () => new Dice(options),
        )
    }

    async connect() {
        await Promise.all(this.pool.map(client => (client as any).connect()))

        return new Proxy(this, {
            get: (target, prop, reciever) => {
                if (prop in target) {
                    return Reflect.get(target, prop, reciever)
                }

                const client = this.getAvailableClient()
                if (client && typeof client[prop] === 'function') {
                    return (...args: any[]) => client[prop](...args)
                }
            },
        }) as any as Dice
    }

    close() {
        this.pool.forEach(client => (client as any).close())
    }

    private getAvailableClient(){
        const client = this.pool[this.nextIndex]
        this.nextIndex = (this.nextIndex + 1) % this.pool.length
        return client
    }
}

export default DicePool
