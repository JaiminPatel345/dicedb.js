import { afterAll, beforeAll, expect, test } from "vitest";

import { Dice, DiceWatch } from "../dist/index.js";

/**
 * @type {Dice}
 */
let dice;

beforeAll(async () => {
    dice = new Dice({ host: "localhost", port: 7379 })
})

afterAll(async () => {
    dice.close();
})

test("HANDSHAKE", async () => {
    await dice.connect()
    expect(true).toBe(true)
    await dice.flush()
})

test("DECR", async () => {
    await dice.decr("foo")

    let resp = await dice.get("foo")

    expect(resp.ack).toBe(-1)
    await dice.flush()
})

test("DECRBY", async () => {
    await dice.decr("foo", 5)

    let resp = await dice.get("foo")

    expect(resp.ack).toBe(-5)
    await dice.flush()
})

test("DEL", async () => {
    await dice.set("foo", "bar")
    const resp = await dice.del("foo")

    expect(resp.ack).toBe(1)
    await dice.flush()
})

test("EXISTS", async () => {
    await dice.set("foo", "bar")

    let resp = await dice.exists("foo")

    expect(resp.ack).toBe(1)
    await dice.flush()
})


test("EXPIRE Command (Only if key doesn't have any expiration set)", async () => {
    await dice.del("foo") // Deleting any previous key if exists

    await dice.set("foo", "bar", { sec: 15 })

    let expire = await dice.expire("foo", 1)

    expect(expire.ack).toBe(0)

    await dice.del("foo")

    await dice.set("foo", "bar")
    expire = await dice.expire("foo", 10)

    expect(expire.ack).toBe(1)
    await dice.flush()
})

test("EXPIRE Command (Only if key have any expiration set)", async () => {
    await dice.set("foo", "bar")

    let expire = await dice.expire("foo", 1, { ifExists: true })

    expect(expire.ack).toBe(0)

    await dice.del("foo")

    await dice.set("foo", "bar", { sec: 10 })
    expire = await dice.expire("foo", 10, { ifExists: true })

    expect(expire.ack).toBe(1)
    await dice.flush()
})

test("EXPIRETIME", async () => {
    await dice.set("foo", "bar")

    let time = await dice.expireTime("foo")

    expect(time.ack).toBe(-1) // Key exists but no expiration set

    await dice.del("foo")

    await dice.set("foo", "bar", { sec: 2 })

    time = await dice.expireTime("foo")

    const t = !(time.ack === -1 || time.ack === -2) || !!time.ack

    expect(t).toBe(true)
    await dice.flush()
})

test("FLUSHDB", async () => {
    await dice.set("foo", "bar")

    let resp = await dice.get("foo")

    expect(resp.ack).toBe("bar")

    await dice.flush()

    resp = await dice.get("foo")

    expect(resp.ack).toBe(undefined)
    await dice.flush()
})

test("GET", async () => {
    await dice.set("foo", "bar")
    const resp = await dice.get("foo")

    expect(resp.ack).toBe("bar")
    await dice.flush()
})

test("GETDEL", async () => {
    await dice.set("foo", "bar")
    let resp = await dice.getdel("foo")

    expect(resp.ack).toBe("bar")
    resp = await dice.get("foo")

    expect(resp.ack).toBe(undefined)
    await dice.flush()
})

test("GETEX", async () => {
    await dice.set("foo", "bar")

    let resp = await dice.getex("foo", { sec: 2 })

    expect(resp.ack).toBe("bar")

    await new Promise(resolve => setTimeout(resolve, 3 * 1000))

    resp = await dice.get("foo")

    expect(resp.ack).toBe(undefined)
    await dice.flush()
})

test("GET.WATCH", async () => {
    const watch = new DiceWatch({
        host: "localhost",
        port: 7379,
    })

    await watch.connect()

    let count = 0

    watch.on("data", (data) => {
        count += 1
        console.log('GET.WATCH foo ', data)
    })

    await watch.watch("foo")

    await dice.set("foo", "bar")
    await dice.set("foo", "barr")
    await dice.set("foo", "barrr")

    // count must have a value of 3

    await new Promise((resolve) => setTimeout(() => resolve(), 1000)) // Adding 1 second delay to avaoid any race conditions because dice and watch both are two different connection

    expect(count).toBe(3)
    await watch.close()
    await dice.flush()
})

test("INCR Command", async () => {
    await dice.incr("count")

    let resp = await dice.get("count")

    expect(resp.ack).toBe(1)
    await dice.flush()
})

test("INCRBY Command", async () => {
    await dice.incr("count", 5)

    let resp = await dice.get("count")

    expect(resp.ack).toBe(5)
    await dice.flush()
})

test("SET", async () => {
    let resp = await dice.set("foo", "bar")

    expect(resp.ack).toBe("OK") // Simple 
    await dice.flush()

    resp = await dice.set("foo", "bar", {
        sec: 2
    })

    const value = await dice.get("foo")

    expect(value.ack).toBe("bar") // With expiration

    await new Promise(resolve => setTimeout(resolve, 3 * 1000))

    const expiredValue = await dice.get("foo")

    expect(expiredValue.ack).toBe(undefined)
    await dice.flush()
})

test("TTL Command", async () => {

    let resp = await dice.ttl("foo")

    expect(resp.ack).toBe(-2) // If key doesn't exists

    await dice.set("foo", "bar")

    resp = await dice.ttl("foo")

    expect(resp.ack).toBe(-1) // Exists but expiration doesn't exists

    await dice.expire("foo", 10)

    resp = await dice.ttl("foo")

    const seconds = resp.ack > 0 // If exists then there will be some postive numbers

    expect(seconds).toBe(true)
    await dice.flush()
})

test("TYPE", async () => {
    let resp = await dice.type("foo")

    expect(resp.ack).toBe("none") // If key doesn't exists

    await dice.set("foo", "bar")

    resp = await dice.type("foo")

    expect(resp.ack).toBe("string") // If key exists and type is string

    await dice.set("bar", 10)

    resp = await dice.type("bar")

    expect(resp.ack).toBe("int") // If key exists and type is int
    await dice.flush()
})

test("UNWATCH", async () => {
    const watch = new DiceWatch({
        host: "localhost",
        port: 7379,
    })

    await watch.connect()

    let count = 0

    watch.on("data", (data) => {
        count += 1
        console.log('GET.WATCH foo ', data)
    })

    await watch.watch("foo")

    await dice.set("foo", "bar")
    await dice.set("foo", "barr")
    await dice.set("foo", "barrr")
    await watch.close()

    await new Promise((resolve) => setTimeout(() => resolve(), 1000)) // Adding 1 second delay to avaoid any race conditions because dice and watch both are two different connection

    await dice.set("foo", "barrr")
    // count must have a value of 3

    expect(count).toBe(3)
    await dice.flush()
})