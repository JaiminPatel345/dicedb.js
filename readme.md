# dicedb.js (Under Development 🚧)  
*A Node.js SDK for Dicedb.io*

---

[![Under Development](https://img.shields.io/badge/status-beta-orange)](https://github.com/kisshan13/dicedb.js)
[![npm version](https://img.shields.io/npm/v/dicedb.js)](https://www.npmjs.com/package/dicedb.js)
[![wakatime](https://wakatime.com/badge/user/fa03c794-b19f-4f4d-b502-abbb422b18c4/project/ca210174-5a87-4e84-b816-5e82cd5be0d2.svg)](https://wakatime.com/badge/user/fa03c794-b19f-4f4d-b502-abbb422b18c4/project/ca210174-5a87-4e84-b816-5e82cd5be0d2)

---

### 📦 Installation
```bash
npm install dicedb.js
```

## 🚀 Quick Start

```js
import {Dice} from 'dicedb.js';

// Initialize client
const client = new Dice({
  host: 'your-dicedb-host', // Replace with your Dicedb host
  port: 6379,              // Default port
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
| GET.WATCH     | `.watch(key)`            | `await client.watch('key')`           |


## 🚧 Features

- ✅ Auto Reconnection
- ✅ Connection pooling
- ✅ `WATCH` / `UNWATCH` support
- ❌ Comprehensive test coverage

## 🔌 Connection Management

```js
const client = new Dice({
  host: 'your-dicedb-host',
  port: 6379,
  // Manual connection control (auto-reconnect not implemented yet)
});

// Explicitly connect/disconnect
await client.connect();
client.close(); // Gracefully close the connection
```

## 🔐 Advanced Usage

### Atomic Operations

```js
// Atomic increment and expire
await client.set('counter', '0');
await client.incr('counter');
await client.expire('counter', { sec: 30 });
```

### Batch Operations

```js
// Batch delete
const keys = ['temp:1', 'temp:2', 'temp:3'];
await client.del(...keys);
```

## ⚠️ Development Status
This SDK is **actively in development.**
**Do not use in production** - breaking changes may occur.