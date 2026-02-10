const pool=require("../../config/db");

async function withConnection(callback){
    const connection=await pool.getConnection();
    try{
        return await callback(connection)
    }
    finally{
        connection.release();
    }
}

module.exports={withConnection};