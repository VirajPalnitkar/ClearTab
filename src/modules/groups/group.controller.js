const pool=require("../../config/db");

async function createGroup(req,res){
    const {name}=req.body;
    const {id}=req.user;
    if(!name)
        return res.status(400).json({error:"Group name required"})
    let connection;
    try{
        connection=await pool.getConnection()
        await connection.beginTransaction();
        const [result]=await connection.execute("INSERT INTO USER_GROUPS(name) VALUES(?)",[name])
        await connection.execute("INSERT INTO GROUP_MEMBERS(group_id,user_id) VALUES(?,?)",[result.insertId,id])
        await connection.commit();
        return res.status(201).json({message:"Group Created"})
    }
    catch(e){
        if(connection)
            await connection.rollback();
        return res.status(500).json({error:"Error in creating group"})
    }
    finally{
        if(connection)
            connection.release();
    }
}

module.exports={createGroup}