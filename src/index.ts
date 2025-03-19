import Dice from './client.js'
import DicePool from './pool.js'
import DiceWatch from './watch.js'
import type {
    DiceConnectionOptions,
    Commands,
    SetOptions,
    GetExOptions,
    ExpireOptions,
    DiceResponse,
} from './types.js'
import { DiceError, DiceCommandErr, DiceConnectionErr } from './errors.js'

export {
    Dice,
    DicePool,
    DiceWatch,
    DiceError,
    DiceCommandErr,
    DiceConnectionErr,
}
export type {
    DiceConnectionOptions,
    Commands,
    SetOptions,
    GetExOptions,
    ExpireOptions,
    DiceResponse,
}
