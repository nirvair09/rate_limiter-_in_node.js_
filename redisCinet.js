import { createClient } from 'redis';
import dotenv from "dotenv";

dotenv.config();

const client = createClient({
    username: 'default',
    password: env.process.REDIS_KEY,

    socket: {
        host: 'redis-15300.c275.us-east-1-4.ec2.redns.redis-cloud.com',
        port: env.process.REDIS_PORT,
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)  // >>> bar

export default client;

