const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken")
const pool=require("../../config/db");

async function getDetails(req,res){
    const {id}=req.user
    const connection=await pool.getConnection();
    const [rows]=await connection.execute("SELECT id,name,email,phone_no FROM USERS WHERE id=?",[id]);
    connection.release();
    return res.status(200).json(rows[0])
}

async function register(req,res){
    const {name,email,phone_no,password}=req.body;
    console.log(req.body)
    console.log(email)
    if(!name || !email || !password || !phone_no)
        return res.status(400).send({error:"Information missing"});
    const hashed_password=await bcrypt.hash(password,10)
    //second paramter is salt rounds, it is a cost factor
    let connection;
    try{
        connection=await pool.getConnection();
        const sql="INSERT INTO USERS(name,email,phone_no,password) Values(?,?,?,?)"
        await connection.execute(sql,[name,email,phone_no,hashed_password]);
    }
    finally{
        connection.release();
    }
    return res.send({message:"User entered Successfully"})
}


async function login(req,res){
    if(!req.body.email || !req.body.password)
        return res.status(400).json({error:"Missing Credentials"})
    const {email,password}=req.body;
    let connection;
    connection=await pool.getConnection();
    const [rows]=await connection.execute("SELECT * FROM USERS WHERE email=?",[email]);
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
    res.json({token})
    connection.release();
}

module.exports={register,login,getDetails}