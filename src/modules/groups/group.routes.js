const express=require("express")
const {createGroup, getGroups,inviteToGroup, acceptInvitation}=require("./group.controller")
const {authorize}=require("../../middleware/auth.middleware")
const router=express.Router();

router.get("/",authorize,getGroups)
router.post("/",authorize,createGroup)
router.post("/:groupID/invite/",authorize,inviteToGroup)
router.post("/accept-invite/",authorize,acceptInvitation)

module.exports=router;