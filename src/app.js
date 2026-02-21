const express=require('express');
const app=express();
const userRouter=require("../src/modules/auth/auth.routes")
const groupRouter=require("../src/modules/groups/group.routes")
const settlementRouter=require("../src/modules/settlements/settlement.routes")
const slipRouter=require("../src/modules/slips/slips.routes")

require("../src/modules/settlements/settlement.services")

app.use(express.json())
app.use(express.urlencoded({extended:true}))
//extended true means it deals with nested objects as well, otherwise on key value pairs of top level

app.use("/user",userRouter)
app.use("/group",groupRouter)
app.use("/settlement",settlementRouter)
app.use("/slip",slipRouter)

app.get("/",(req,res)=>{
    res.send("App is running")
})

module.exports=app;