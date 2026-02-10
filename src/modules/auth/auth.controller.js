const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken")
const {withConnection}=require("./auth.services")

async function getDetails(req,res){
    try{
        const {id}=req.user
        const [rows]=await withConnection((conn)=>{
        return conn.execute("SELECT id,name,email,phone_no FROM USERS WHERE id=?",[id]);
        })
        return res.status(200).json(rows[0])
    }
    catch(e){
        res.status(500).json({error:"Error in getting details"})
    }
}

async function register(req,res){
    try{
        const {name,email,phone_no,password}=req.body;
        if(!name || !email || !password || !phone_no)
            return res.status(400).send({error:"Information missing"});
        const [rows]=await withConnection(async (conn)=>{
            return conn.execute("SELECT id FROM USERS WHERE email=?",[email]);
        })
        if(rows.length>0)
            return res.status(409).json({error:"User already exists"})
        const hashed_password=await bcrypt.hash(password,10)
        //second paramter is salt rounds, it is a cost factor
        await withConnection(async (conn)=>{
            const sql="INSERT INTO USERS(name,email,phone_no,password) Values(?,?,?,?)"
            return conn.execute(sql,[name,email,phone_no,hashed_password]);
        })
        return res.status(201).json({message:"User entered Successfully"})
    }
    catch(e){
        res.status(500).json({error:"Error in registration"})
    }
}


async function login(req,res){
    try{
        if(!req.body.email || !req.body.password)
            return res.status(400).json({error:"Missing Credentials"})
        const {email,password}=req.body;
        const [rows]=await withConnection(async (conn)=>{
            return conn.execute("SELECT * FROM USERS WHERE email=?",[email]);
        })
        if(rows.length==0)
            return res.status(404).json({error:"No such user"})
        const user=rows[0];
        const match=await bcrypt.compare(password,user.password)
        if(!match)
            return res.status(400).json({error:"Invalid Password"})
        //JWT has three parts header.payload.signature
        //header has metadata like algo used and token type
        //payload had the actual data
        //SIgnatire created using Header + Payload + Secret key
        const token=jwt.sign({id:user.id},process.env.JWT_SECRET,{expiresIn:"1h"})
        return res.json({token})
    }
    catch(e){
        res.status(500).json({error:"Error in login"})
    }
}

module.exports={register,login,getDetails}