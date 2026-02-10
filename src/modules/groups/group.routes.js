const express=require("express")
const {createGroup}=require("./group.controller")
const {authorize}=require("../../middleware/auth.middleware")
const router=express.Router();

router.post("/",authorize,createGroup)

module.exports=router;