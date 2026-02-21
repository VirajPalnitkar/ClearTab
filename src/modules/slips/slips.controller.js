const pool=require("../../config/db")

async function createSlip(req,res){
    const {id:from_user_id}=req.user;
    const {to_user_id,reason,amount,group_id}=req.body;
    let connection;
    try{
        connection=await pool.getConnection();
        await connection.beginTransaction();
        const [result]=await connection.execute(`
            SELECT * from group_members gm1 inner join group_members gm2 
            on gm1.group_id=gm2.group_id
            where gm1.group_id=? and gm1.user_id=? and gm2.user_id=?    
        `,[group_id,from_user_id,to_user_id])
        console.log(result)
        if(result.length==0)
            throw new Error("Users not in a group")
        const [rows]=await connection.execute(`
            SELECT id FROM SETTLEMENT_CYCLES WHERE GROUP_ID=? AND STATUS='ACTIVE'    
        `,[group_id])
        if(rows.length==0)
            throw new Error("No active settlement cycle")
        const settlement_cycle_id=rows[0].id;
        await connection.execute(`
            INSERT INTO payment_slips(from_user_id,to_user_id,group_id,settlement_cycle_id,amount,reason)
            VALUES(?,?,?,?,?,?)     
        `,[from_user_id,to_user_id,group_id,settlement_cycle_id,amount,reason])
        await connection.commit();
        res.status(201).json({"message":"Payment Slip Issued"})
    }
    catch(e){
        if(connection)
            await connection.rollback();
        console.log(e.message)
        return res.status(400).json({error:"COuldnt Create slip"})
    }
    finally{
        if(connection)
            connection.release()
    }
}

module.exports={createSlip}