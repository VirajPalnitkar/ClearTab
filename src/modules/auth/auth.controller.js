const bcrypt=require("bcrypt");
const pool=require("../../config/db");

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

module.exports={register}