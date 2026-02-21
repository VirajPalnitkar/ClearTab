const express=require("express");
const {createSettlementCycle,getSettlementCycle,closeSettlementCycle}=require("./settlement.controller")
const {authorize}=require("../../middleware/auth.middleware")

const router=express.Router();

router.post("/settlement_cycle",authorize,createSettlementCycle)
router.get("/groups/:group_id/settlement_cycle",authorize,getSettlementCycle)
router.post("/groups/:id/settlement_cycle/close",authorize,closeSettlementCycle)

module.exports=router;