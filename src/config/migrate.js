const fs=require('fs');
const path=require('path');
const pool=require("./db");

//always have semi-colon before iife
(async ()=>{
    const connection=await pool.getConnection();
    try{
        await connection.beginTransaction();
        const [rows]=await connection.query("SELECT name FROM migrations");
        //Return is of type [ rows,  fields], therefore we destructure
        const executed=new Set(rows.map(r=>r.name))
        const files=fs.readdirSync(path.join(__dirname,"migrations")).sort();
        for(const file of files){
            console.log(file)
            if(executed.has(file))
                continue;
            const sql=fs.readFileSync(
                path.join(__dirname,"migrations",file),
                "utf8"
            )
            await connection.query(sql);
            await connection.query("INSERT INTO MIGRATIONS(name) VALUES(?)",[file]);
            console.log("Ran file")
        }
        await connection.commit();
        await connection.release();
        await pool.end();
        process.exit(0);
    }
    catch(err){
        await connection.rollback();
        connection.release();
        await pool.end();   //  important
        console.error(err);
        process.exit(1);
    }
})()