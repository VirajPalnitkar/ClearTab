// jobs/settlementCycleJob.js
const cron = require("node-cron");
const pool = require("../../config/db");

async function closeExpiredCycles() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `UPDATE settlement_cycles 
       SET status = 'CLOSED', end_date = NOW() 
       WHERE status = 'ACTIVE' AND end_date <= NOW()`
    );

    await connection.commit();
    console.log(`Closed ${result.affectedRows} expired settlement cycle(s)`);
  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Failed to auto-close cycles:", err);
  } finally {
    if (connection) connection.release();
  }
}

// Runs every hour
cron.schedule("0 * * * *", () => {
  console.log("Checking for expired settlement cycles...");
  closeExpiredCycles();
});

module.exports = { closeExpiredCycles };