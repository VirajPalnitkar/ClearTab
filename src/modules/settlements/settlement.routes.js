const express=require("express");
const {createSettlementCycle,getSettlementCycle}=require("./settlement.controller")
const {authorize}=require("../../middleware/auth.middleware")

const router=express.Router();

router.post("/settlement_cycle",authorize,createSettlementCycle)
router.get("/settlement_cycle",authorize,getSettlementCycle)


module.exports=router;