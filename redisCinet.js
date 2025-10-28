import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 'tu71qNuU5Q7JgkVrSA4sEWiHz8kj93ht',
    socket: {
        host: 'redis-15300.c275.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 15300
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)  // >>> bar

export default client;

