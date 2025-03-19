import { Dice } from "../dist/index.js"

const dice = new Dice({ host: "localhost", port: 7379 })

await dice.connect()

try {
    await dice.set("foo", "bar")
    let expire = await dice.expire("foo", 10)

    console.log(expire)

    dice.expire("foo", 1)
} catch (error) {
    console.log(error)
}