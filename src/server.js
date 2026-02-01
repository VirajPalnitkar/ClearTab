require("dotenv").config();
const app=require("./app")
const pool=require("./config/db")


app.listen(process.env.PORT || 3000,()=>{
    console.log("Server listening at PORT:-"+process.env.PORT);
})