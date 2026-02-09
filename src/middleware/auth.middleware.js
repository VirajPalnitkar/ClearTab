const jwt=require("jsonwebtoken")

async function authorize(req,res,next){
    const auth=req.headers.authorization.split(" ");
    if(auth[0]!="Bearer" || !auth[1])
        return res.status(400).json({error:"No token"})
    const token=auth[1];
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.body=decoded
        next()
    }
    catch(e){
        res.status(401).json({error:"Unauthorized"})
    }
}
module.exports={authorize}