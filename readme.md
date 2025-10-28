# **Node.js Rate Limiter with Redis**

A simple yet production-grade **rate limiting middleware** built with **Express** and **Redis**.
This project limits the number of requests a client (based on IP) can make within a specific time window — preventing abuse, DoS attacks, and unnecessary server load.

---

## ⚙️ **Why use a rate limiter?**

APIs and web servers can be overwhelmed if a client (or bot) sends too many requests too fast.
A **rate limiter** acts like a bouncer — it lets normal traffic through, but blocks anyone who’s hammering your endpoint.

Practical uses:

* Prevent brute-force login attempts.
* Stop users from overloading your backend.
* Maintain fair usage when you have limited resources or free tiers.
* Protect APIs exposed publicly.

---

## 💡 **Why I built it**

I built this to understand how **middleware**, **state tracking**, and **Redis** work together in real backend systems.
It’s not just an academic exercise — this pattern appears in every major web service (GitHub, Twitter, Cloudflare all use some form of it).

---

## 🧠 **My approach — from naive to production**

### 1. **First attempt: In-memory counter**

I started with a simple JavaScript object:

```js
const requestCount = {};
```

Every time a request came in, I increased that IP’s count.
Then every minute, I used `setInterval()` to reset all counts.

### 🔴 Why that was bad:

* It resets *everyone* globally every minute (unfair).
* Memory grows if many IPs hit your app.
* Doesn’t scale — if you run multiple Node servers, each has its own memory, so limits are inconsistent.
* Loses all data when the app restarts.

---

### 2. **Improved version: Per-IP timers**

I changed the logic so each IP had its own timestamp:

```js
requestCount[ip] = { count: 1, firstRequestTime: Date.now() };
```

That made the limiter fair — each IP got its own window.
But still: it was **in-memory**, so restarting the app wiped everything, and multiple instances couldn’t coordinate.

---

### 3. **Final version: Redis-backed limiter**

Redis fixed all of those issues.

---

## 🚀 **Why Redis? What is Redis?**

**Redis** (Remote Dictionary Server) is an **in-memory data store** — lightning-fast, atomic, and can automatically expire keys.
Think of it as a super-efficient key-value database that lives in RAM.

### 🔹 Why it’s perfect for rate limiting:

* Operations like `INCR` (increment) and `EXPIRE` are **atomic** → safe even under heavy concurrency.
* Key expiry means no manual cleanup — Redis deletes data automatically after the time window.
* Works across multiple servers → distributed and scalable.
* Much faster than traditional databases because it runs entirely in memory.

### 🔸 Redis vs typical databases:

| Feature               | Redis                                     | SQL / NoSQL DB     |
| --------------------- | ----------------------------------------- | ------------------ |
| Storage               | In-memory                                 | Disk-based         |
| Speed                 | Microseconds                              | Milliseconds       |
| Use Case              | Caching, counters, real-time ops          | Persistent data    |
| Auto expiry           | Yes                                       | No                 |
| Data type flexibility | Strings, lists, sets, sorted sets, hashes | Tables / Documents |

So Redis isn’t meant to store your user data forever — it’s meant to handle **high-speed transient data**, like sessions, tokens, or rate-limits.

---

## 🧱 **How this project works**

1. Each request’s IP is used as a key:
   `rate_limit:<ip>`

2. On each hit:

   * Redis `INCR` increments the counter.
   * If it’s the first request, `EXPIRE` sets a 60-second TTL.
   * If count > limit → return **HTTP 429 (Too Many Requests)**.
   * Otherwise, allow the request through.

3. Redis automatically resets the key after TTL expires.

All this happens **atomically** inside Redis — no race conditions.

---

## 🛠️ **How others can use this project**

### Option 1 — As a middleware

Clone your repo and import your limiter middleware:

```js
import rateLimiter from './rateLimiter.js';
app.use(rateLimiter);
```

### Option 2 — As a reference

Developers can adapt the logic for:

* Express
* Fastify
* NestJS
* Koa
  or any Node-based HTTP framework.

They just need a Redis instance and the same `INCR` + `EXPIRE` logic.

---

## ⚡ **How to deploy**

1. **Setup Redis**

   * Locally via Docker

     ```bash
     docker run --name redis -p 6379:6379 -d redis
     ```
   * or use a managed cloud instance (Redis Cloud, AWS ElastiCache, etc.)

2. **Set environment variables**

   ```bash
   REDIS_HOST=your_host
   REDIS_PORT=your_port
   REDIS_USERNAME=default
   REDIS_PASSWORD=your_password
   ```

3. **Deploy your Node app**

   * You can use **Render**, **Vercel**, **Railway**, or a **VPS** (like EC2).
   * Just make sure the Redis server is accessible (open port or same network).

4. **Run your app**

   ```bash
   npm start
   ```

   or

   ```bash
   node app.js
   ```

5. **Test it**

   * Open Thunder Client or browser → hit `http://yourdomain.com/` multiple times.
   * You’ll get a 429 after the limit.

---

## 🌍 **Example use case**

Imagine you have a login API `/login`.
To prevent brute force:

```js
app.post('/login', rateLimiter, (req, res) => {
  // handle login logic
});
```

That’s it — you’ve just protected your endpoint from spam or attack.

---

## 🧩 **Future Improvements**

* Implement **sliding window** or **token bucket** algorithm for smoother limiting.
* Add **Redis Cluster** for massive scale.
* Create an npm package (`express-redis-rate-limiter`) so others can just `npm install` it.

---

## ✨ **Summary**

| Concept            | Why it matters                               |
| ------------------ | -------------------------------------------- |
| Rate limiter       | Controls client request flow                 |
| In-memory approach | Simple but not scalable                      |
| Redis-based        | Distributed, fast, and reliable              |
| Benefit            | Protects your app from overload              |
| Use case           | API throttling, spam control, DoS mitigation |
