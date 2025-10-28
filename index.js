express=require('express');

const app=express();

app.listen(9000,()=>{
    console.log("App is running on port 9000");
})


app.get('/',(req,res)=>{
    console.log("Request received");
    res.status(200).send("Hello from rate limiter in nodejs");
})