const express = require("express");
const { authorize } = require("../../middleware/auth.middleware");

const {
    createSlip,
    acceptSlip,
    rejectSlip,
    deleteSlip,
    editSlip,
    getPendingSlips,
    getGroupSlips
} = require("./slips.controller");

const router = express.Router();

router.post("/", authorize, createSlip);
router.post("/:slip_id/approve", authorize, acceptSlip);
router.post("/:slip_id/reject", authorize, rejectSlip);
router.delete("/:slip_id", authorize, deleteSlip);
router.patch("/:slip_id", authorize, editSlip);
router.get("/pending", authorize, getPendingSlips);
router.get("/group/:group_id", authorize, getGroupSlips);


module.exports = router;