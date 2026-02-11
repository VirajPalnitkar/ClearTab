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

async function getGroups(req,res){
    const {id}=req.user;
    let connection;
    try{
        connection=await pool.getConnection();
        const [rows]=await connection.execute(`select u.id,u.name 
                from user_groups u inner join group_members g
                on u.id=g.group_id 
                where g.user_id=?`,[id]);
        return res.status(200).json(rows);
    }
    catch(e){
        return res.status(500).json({error:"Failed to get groups"})
    }
    finally{
        if(connection)
            connection.release();
    }
}

async function inviteToGroup(req,res){
    const {id}=req.user;
    const {invited_user_id}=req.body;
    const {groupID}=req.params;
    let connection;
    try{
        connection=await pool.getConnection();
        const [result]=await connection.execute(`
            INSERT INTO group_invitations(group_id,invited_user_id,invited_by_user_id)
            VALUES(?,?,?)`,
            [groupID,invited_user_id,id]
        )
        res.status(201).json({message:"Invitation sent"})
    }
    catch(e){
        return res.status(500).json({error:"Failed to invite to the group"})
    }
    finally{
        if(connection)
            connection.release();
    }
}

// async function acceptInvitation(req,res) {
//     const {inv_id,group_id,user_id}=req.body;
//     let connection;
//     try{
//         connection=await pool.getConnection();
//         await connection.beginTransaction();
//         await connection.execute("INSERT INTO GROUP_MEMBERS(group_id,user_id) VALUES(?,?)",[group_id,user_id]);
        
//         await connection.commit()
//         res.status(201).json({message:"Invitation accepted"})
//     }
//     catch(e){
//         await connection.rollback();
//         return res.status(500).json({error:"Failed to accept invite"})
//     }
//     finally{
//         if(connection)
//             connection.release();
//     }
// }

module.exports={createGroup,getGroups,inviteToGroup};