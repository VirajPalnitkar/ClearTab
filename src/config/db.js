const mysql=require("mysql2/promise")
//using the promise wrapper to utilise the built in async/await support


//Creating connection pool so that we can reuse the existing connections and 
//dont waste time creating new connections and dont overwhelm the sql database
const pool=mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
    waitForConnections:true,
    //when all connections are busy, then the app waits for a connection and does not crash
    connectionLimit:10,
    //maximum 10 connections at a time
    queueLimit:0,
    //max number of requests that can wait for connection
    //0 means infinite , we can set to a particular value to limit them also
    enableKeepAlive:true,
    // Without keepalive:
    // Connection idle for 2+ minutes → Firewall closes it → Next query fails
    // With keepalive:
    // Every 30 seconds, send TCP keepalive packet → Connection stays alive
    keepAliveInitialDelay:0,
    dateStrings:true,
    //Returns as strings , otherwise javaScript objects
    timezone:'+00:00'
    //sets to utc time(for global apps)
})

pool.getConnection()
.then(conn=>{
    console.log("MySql Connected");
    conn.release();
    //this checks out the connection for reuse, without this block forever
})
.catch(err=>{
    console.error("MySql connection Failed",err);
    process.exit(1);
})

module.exports=pool;