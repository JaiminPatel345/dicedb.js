
<img src="https://dicedb.io/dicedb-logo-dark.png" style="width: 350px;" />

# dicedb.js
*A Node.js SDK for [DiceDB](https://dicedb.io), a fast, reactive, in-memory database.*

---

[![npm version](https://img.shields.io/npm/v/dicedb.js)](https://www.npmjs.com/package/dicedb.js)
[![wakatime](https://wakatime.com/badge/user/fa03c794-b19f-4f4d-b502-abbb422b18c4/project/ca210174-5a87-4e84-b816-5e82cd5be0d2.svg)](https://wakatime.com/badge/user/fa03c794-b19f-4f4d-b502-abbb422b18c4/project/ca210174-5a87-4e84-b816-5e82cd5be0d2)

## 📦 Installation
```bash
npm install dicedb.js
```

## 🚀 Quick Start
```js
import { Dice } from 'dicedb.js';

// Initialize client
const client = new Dice({
  host: 'your-dicedb-host', // Replace with your DiceDB host
  port: 6379,               // Default port
});

// Connect to server
await client.connect();

// Set a key
await client.set('user:1', JSON.stringify({ name: 'Alice' }));

// Get the key
const data = await client.get('user:1');
console.log(JSON.parse(data.ack)); // { name: 'Alice' }

// Delete the key
await client.del('user:1');

// Close connection
client.close();
```

## ✅ Supported Commands
| Command  | Method                  | Example                              |
|----------|-------------------------|--------------------------------------|
| SET      | `.set(key, value)`      | `await client.set('key', 'value')`   |
| GET      | `.get(key)`             | `await client.get('key')`            |
| DECR     | `.decr(key, value?)`    | `await client.decr('counter', 5)`    |
| DEL      | `.del(...keys)`         | `await client.del('key1', 'key2')`   |
| INCR     | `.incr(key, value?)`    | `await client.incr('counter')`       |
| EXISTS   | `.exists(...keys)`      | `await client.exists('key1', 'key2')`|
| EXPIRE   | `.expire(key, opts)`    | `await client.expire('key', { sec: 60 })` |
| GETDEL   | `.getdel(key)`          | `await client.getdel('key')`         |
| GETEX    | `.getex(key, opts)`     | `await client.getex('key', { ex: 60 })` |
| FLUSHDB  | `.flush()`              | `await client.flush()`               |
| TTL      | `.ttl(key)`             | `await client.ttl('key')`            |
| TYPE     | `.type(key)`            | `await client.type('key')`           |
| WATCH    | `.watch(key)`           | `await client.watch('key')`          |
| UNWATCH    |            |           |

## 📖 Examples

### 1️⃣ SET & GET Example
```js
await client.set('foo', 'bar');
const value = await client.get('foo');
console.log(value.ack); // 'bar'
```

### 2️⃣ Incrementing a Counter
```js
await client.set('counter', 0);
await client.incr('counter');
console.log((await client.get('counter')).ack); // '1'
```

### 3️⃣ Using EXPIRE
```js
await client.set('session', 'active');
await client.expire('session', { sec: 60 });
```

### 4️⃣ Deleting a Key
```js
await client.del('session');
```

### 5️⃣ Watching a Key
```js
const watch = await client.watch('user:1');

watch.on("data", (data) => {
  console.log(data);
})
```

## 🔌 Connection Management
```js
const client = new Dice({
  host: 'your-dicedb-host',
  port: 6379,
});

await client.connect();
client.close(); // Gracefully close the connection
```

## 🚧 Features
- ✅ Auto Reconnection
- ✅ Connection Pooling
- ✅ `WATCH` / `UNWATCH` Support
- ✅ Comprehensive Test Coverage

## 🔗 Useful Links
- [DiceDB Official Website](https://dicedb.io)
- [DiceDB Benchmarks](https://dicedb.io/benchmarks)
- [DiceDB Commands](https://dicedb.io/commands/get)
- [DiceDB GitHub](https://github.com/dicedb/dice)
- [DiceDB Discord](https://discord.gg/6r8uXWtXh7)
- [Follow DiceDB on Twitter](https://twitter.com/thedicedb)

## ⚠️ Development Status
This SDK is **actively in development.**
**Do not use in production** - breaking changes may occur.