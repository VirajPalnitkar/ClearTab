const express=require('express')
const {authorize}=require("../../middleware/auth.middleware")
const {createSlip}=require("./slips.controller")

const router=express.Router();

router.post("/",authorize,createSlip)

module.exports=router;