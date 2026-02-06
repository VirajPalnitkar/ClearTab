const express=require('express');
const app=express();
const userRouter=require("../src/modules/auth/auth.routes")

app.use(express.json())
app.use(express.urlencoded({extended:true}))
//extended true means it deals with nested objects as well, otherwise on key value pairs of top level

app.use("/user",userRouter)

app.get("/",(req,res)=>{
    res.send("App is running")
})

module.exports=app;