const express=require('express')
const {authorize}=require("../../middleware/auth.middleware")
const {createSlip,acceptSlip}=require("./slips.controller")

const router=express.Router();

router.post("/",authorize,createSlip)
router.post("/accept",authorize,acceptSlip)

module.exports=router;