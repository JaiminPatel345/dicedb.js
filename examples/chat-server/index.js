import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { Dice, DicePool, DiceWatch } from "dicedb.js"
import { generateID } from "./utils.js";

const app = express();
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
})

const dice = new Dice({ host: "localhost", port: 7379 });

await dice.connect();

app.use(express.json());
app.use(cors("*"));

/**
 * @type {Map<string, {id: string, name: string, socket: Socket}[]>}
 */
const map = new Map();

/**
 * @type {Map<string, DiceWatch>}
 */
const watch = new Map();

async function setMessage(key, { type, id, data, name }) {
    const onlineCount = await dice.get(`${key}:count`)
    return await dice.set(key, JSON.stringify({ type, id, data, online: onlineCount.ack | 0, name: name }))
}

io.on("connection", (socket) => {
    const id = generateID();
    let name = "";

    socket.emit("socket-id", id);
    console.log(`Connected ID: ${id}`)
    socket.on("join", async (data) => {
        const json = JSON.parse(data);
        const key = json["key"];
        const name = json["name"];

        const isWatchSessionExists = watch.get(key)

        if (!isWatchSessionExists) {
            const w = await dice.watch(key)

            w.on("data", (ack) => {
                if (ack) {
                    const json = JSON.parse(ack)
                    const sender = json["id"]
                    const listeners = map.get(key)

                    listeners.forEach((lis) => {
                        lis.socket.emit("chat", JSON.stringify({ ...json, isSelf: sender === lis.id }))
                    })
                }
            })

            watch.set(key, w)
        }

        const listeners = map.get(key)
        if (listeners?.length) {
            map.set(key, [...listeners, { id: id, name: name, socket: socket }]);
        } else {
            map.set(key, [{ id: id, name: name, socket: socket }]);
        }

        console.log(`${name} joined ${key}`)
        await dice.incr(`${key}:count`)
        await setMessage(key, { type: "greet", data: `${name} has entered the chat`, id: id, name })

        socket.on("chat", async (data) => {
            await setMessage(key, { type: "chat", id: id, data: data, name: name })
        });

        socket.on("disconnect", async () => {
            socket.removeAllListeners();

            const users = map.get(key)
            map.set(key, users.filter((user) => user.id !== id))

            await dice.decr(`${key}:count`)
            await setMessage(key, { type: "greet", data: `${name} has left the chat`, id: id, name: name })
            console.log(`${name} ${id} disconnectedd`)
        })
    });
})

console.log("Running Application at port 3000")
httpServer.listen(3000);