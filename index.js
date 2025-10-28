express = require('express');
const ip = require('ip');

const app = express();


const MAX_REQ_LIMIT = 10;
const MAX_TIME_WINDOW = 60_000; // 1 minute in terms of miliseconds

const requestCount = {};

app.use((req, res, next) => {
    const clientIP = req.ip;

    if (!requestCount[clientIP]) {
        requestCount[clientIP] = 1;
    } else {
        requestCount[clientIP]++;
    }

    if (requestCount[clientIP] > MAX_REQ_LIMIT) {
        return res.status(429).send("Too many requests , you hit the rate limitter , kindly try after 1min");

    } else {
        next();
    }

})

setInterval(() => {
    for (const id in requestCount) {
        requestCount[id] = 0;
    }
}, MAX_TIME_WINDOW)



app.get('/', (req, res) => {
    console.log("Request received");
    res.status(200).send("Hello from rate limiter in nodejs");
});

app.listen(9000, () => {
    console.log("App is running on port 9000");
    console.log(`my ip adress is ${ip.address()}`);
});


