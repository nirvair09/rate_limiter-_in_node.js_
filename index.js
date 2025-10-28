const express = require('express');
// const Redis=require('ioredis');
// const ip = require('ip');
import client from './redisCinet';

const app = express();


const MAX_REQ_LIMIT = 10;
const MAX_TIME_WINDOW = 60; // 1 minute in redis

const requestCount = {};

//Instead of just storing a count, 
// we’ll store both count and timestamp of the first request in that minute.


// app.use((req, res, next) => {


//     // if (!requestCount[clientIP]) {
//     //     requestCount[clientIP] = 1;
//     // } else {
//     //     requestCount[clientIP]++;
//     // }

//     // if (requestCount[clientIP] > MAX_REQ_LIMIT) {
//     //     return res.status(429).send("Too many requests , you hit the rate limitter , kindly try after 1min");

//     // } else {
//     //     next();
//     // }
//     const clientIP = req.ip;

//     if (requestCount[clientIP] === undefined) {
//         requestCount[clientIP ]= {
//             count: 1,
//             firstRequestTime: Date.now(),
//         };

//         return next();
//     }

//     const data = requestCount[clientIP];
//     const timePassed = Date.now() - data.firstRequestTime;

//     if (timePassed > MAX_TIME_WINDOW) {
//         requestCount[clientIP] = { count: 1, firstRequestTime: Date.now() };
//         return next();
//     }

//     data.count++;

//     if (data.count > MAX_REQ_LIMIT) {
//         return res.status(429).send("Too many requests , you hit the rate limitter , kindly try after 1min");

//     }
//     next();

// })

// setInterval(() => {
//     for (const id in requestCount) {
//         requestCount[id] = 0;
//     }
// }, MAX_TIME_WINDOW)


app.use(async(req,res,next)=>{
    try {
        const clinedIP=req.ip;

        const redisKey=`rate_limit:${clinedIP}`;

        const currentCount= await client.incr(redisKey);

        if(currentCount===1){
            await client.expire(redisKey,MAX_TIME_WINDOW);
        }

        if(currentCount>MAX_TIME_WINDOW){
            const ttl= await client.ttl(redisKey);

            return res
            .status(429)
            .send(`Too many requests , you hit the rate limitter , kindly try after ${ttl} seconds`);
        }

        next();
        
    } catch (error) {

        console.log('Rate limiter error', error);

        next();
        
    }
})


app.get('/', (req, res) => {
    res.status(200).send("Hello from rate limiter in nodejs");
});

app.listen(9000, () => {
    console.log("App is running on port 9000");
});


