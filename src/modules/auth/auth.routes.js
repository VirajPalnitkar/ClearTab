const express=require('express')
const {register,login,getDetails}=require("./auth.controller")
const router=express.Router()
const {authorize}=require("../../middleware/auth.middleware")

router.post("/register",register)
router.post("/login",login)
router.get("/",authorize,getDetails)

module.exports=router;