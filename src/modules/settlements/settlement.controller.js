const pool=require("../../config/db")

async function createSettlementCycle(req,res){
    const {startDate,duration,group_id}=req.body;
    const {id}=req.user;
    let connection;
    try{
        connection=await pool.getConnection();
        await connection.beginTransaction()
        const endDateObj=new Date(startDate);
        endDateObj.setDate(endDateObj.getDate()+parseInt(duration))
        const mysqlEndDate = endDateObj.toISOString().slice(0, 19).replace('T', ' ');
        const mysqlStartDate = new Date(startDate).toISOString().slice(0, 19).replace('T', ' ');
        const [rows1]=await connection.execute(`
                Select * from group_members where group_id=? and user_id=?
            `,[group_id,id])
        if(rows1.length==0)
            throw new Error();
        const [rows]=await connection.execute(`
                Select * from settlement_cycles where group_id=? and start_date<=? and end_date>=?
            `,[group_id,mysqlStartDate,mysqlEndDate])
        if(rows.length>0)
            throw new Error();
        const [result]=await connection.execute(`
                INSERT into settlement_cycles(group_id,start_date,end_date) values(?,?,?)         
            `,[group_id,mysqlStartDate,mysqlEndDate])
        console.log(result)
        await connection.commit();
        return res.status(201).json({"message":"Cycle Created Successfully"})
    }
    catch(e){
        if(connection)
            connection.rollback();
        console.log(e.message)
        return res.status(500).json({"error":"Couldnt create a settlement cycle"});
    }
    finally{
        if(connection)
            connection.release();
    }
}

async function getSettlementCycle(req,res){
    const {group_id}=req.body;
    const {id}=req.user;
    let connection;
    try{
        connection=await pool.getConnection();
        const [rows1]=await connection.execute(`
                Select * from group_members where group_id=? and user_id=?
            `,[group_id,id])
        if(rows1.length==0)
            throw new Error();
        const [rows]=await connection.execute(`
                Select * from settlement_cycles where group_id=? and status='ACTIVE'
            `,[group_id])
        return res.status(200).json(rows)
    }
    catch(e){
        console.log(e.message)
        return res.status(500).json({"error":"Couldnt create a settlement cycle"});
    }
    finally{
        if(connection)
            connection.release();
    }
}

module.exports={createSettlementCycle,getSettlementCycle};