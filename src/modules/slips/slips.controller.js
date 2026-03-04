const pool = require("../../config/db");

async function createSlip(req, res) {
    const { id: from_user_id } = req.user;
    const { to_user_id, reason, amount, group_id } = req.body;

    let connection;

    try {
        if (!amount || amount <= 0)
            return res.status(400).json({ error: "Invalid amount" });

        if (parseInt(from_user_id) === parseInt(to_user_id))
            return res.status(400).json({ error: "Cannot create slip to yourself" });

        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Ensure both users belong to group
        const [members] = await connection.execute(
            `SELECT user_id 
             FROM group_members 
             WHERE group_id = ? 
             AND user_id IN (?, ?)`,
            [group_id, from_user_id, to_user_id]
        );

        if (members.length !== 2) {
            await connection.rollback();
            return res.status(403).json({ error: "Users are not in the same group" });
        }

        //  Lock active settlement cycle
        const [cycles] = await connection.execute(
            `SELECT id 
             FROM settlement_cycles 
             WHERE group_id = ? 
             AND status = 'ACTIVE'
             FOR UPDATE`,
            [group_id]
        );

        if (cycles.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: "No active settlement cycle" });
        }

        const settlement_cycle_id = cycles[0].id;

        // Insert slip
        await connection.execute(
            `INSERT INTO payment_slips
            (from_user_id, to_user_id, group_id, settlement_cycle_id, amount, reason, status)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
            [from_user_id, to_user_id, group_id, settlement_cycle_id, amount, reason]
        );

        await connection.commit();

        return res.status(201).json({ message: "Payment slip created" });

    } catch (err) {
        if (connection) await connection.rollback();
        return res.status(500).json({ error: "Failed to create slip" });
    } finally {
        if (connection) connection.release();
    }
}


async function acceptSlip(req, res) {
    const { id: user_id } = req.user;
    const { slip_id } = req.params;

    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Lock slip
        const [rows] = await connection.execute(
            `SELECT * 
             FROM payment_slips 
             WHERE id = ? 
             AND status = 'PENDING'
             FOR UPDATE`,
            [slip_id]
        );

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: "Slip not found or already processed" });
        }

        const slip = rows[0];

        //  Ensure correct approver
        if (slip.to_user_id !== user_id) {
            await connection.rollback();
            return res.status(403).json({ error: "Not authorized to approve this slip" });
        }

        //  Ensure settlement cycle still ACTIVE
        const [cycle] = await connection.execute(
            `SELECT id 
             FROM settlement_cycles 
             WHERE id = ? 
             AND status = 'ACTIVE'
             FOR UPDATE`,
            [slip.settlement_cycle_id]
        );

        if (cycle.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: "Settlement cycle is closed" });
        }

        // Insert into ledger (CORRECT direction)
        await connection.execute(
            `INSERT INTO ledger_entries
            (from_user_id, to_user_id, group_id, settlement_cycle_id, amount, reason)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                slip.from_user_id,
                slip.to_user_id,
                slip.group_id,
                slip.settlement_cycle_id,
                slip.amount,
                slip.reason
            ]
        );

        //  Update slip status
        await connection.execute(
            `UPDATE payment_slips 
             SET status = 'APPROVED'
             WHERE id = ?`,
            [slip_id]
        );

        await connection.commit();

        return res.status(200).json({
            message: "Slip approved and ledger entry created"
        });

    } catch (err) {
        if (connection) await connection.rollback();
        return res.status(500).json({ error: "Failed to approve slip" });
    } finally {
        if (connection) connection.release();
    }
}

async function editSlip(req, res) {
    const { id: user_id } = req.user;
    const { amount, reason } = req.body;
    const {slip_id}=req.params;
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `SELECT * FROM payment_slips 
             WHERE id = ? AND status = 'PENDING'
             FOR UPDATE`,
            [slip_id]
        );

        if (rows.length === 0)
            throw new Error("Slip not found or already processed");

        const slip = rows[0];

        if (slip.from_user_id !== user_id)
            throw new Error("Not authorized to edit this slip");

        await connection.execute(
            `UPDATE payment_slips 
             SET amount = ?, reason = ?
             WHERE id = ?`,
            [amount, reason, slip_id]
        );

        await connection.commit();

        return res.status(200).json({
            message: "Slip updated successfully"
        });

    } catch (err) {
        if (connection) await connection.rollback();
        return res.status(400).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
}

async function getGroupSlips(req, res) {
    const { group_id } = req.params;

    try {
        const [rows] = await pool.execute(
            `SELECT * FROM payment_slips 
             WHERE group_id = ?`,
            [group_id]
        );

        return res.status(200).json(rows);
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch slips" });
    }
}

async function rejectSlip(req, res) {
    const { id: user_id } = req.user;
    const { slip_id } = req.params;

    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `SELECT * FROM payment_slips 
             WHERE id = ? AND status = 'PENDING'
             FOR UPDATE`,
            [slip_id]
        );

        if (rows.length === 0)
            throw new Error("Slip not found or already processed");

        const slip = rows[0];

        if (slip.to_user_id !== user_id)
            throw new Error("Not authorized to reject this slip");

        await connection.execute(
            `UPDATE payment_slips 
             SET status = 'REJECTED'
             WHERE id = ?`,
            [slip_id]
        );

        await connection.commit();

        return res.status(200).json({
            message: "Slip rejected successfully"
        });

    } catch (err) {
        if (connection) await connection.rollback();
        return res.status(400).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
}


async function deleteSlip(req, res) {
    const { id: user_id } = req.user;
    const { slip_id } = req.params;

    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [rows] = await connection.execute(
            `SELECT * FROM payment_slips 
             WHERE id = ? AND status = 'PENDING'
             FOR UPDATE`,
            [slip_id]
        );

        if (rows.length === 0)
            throw new Error("Slip not found or already processed");

        const slip = rows[0];

        if (slip.from_user_id !== user_id)
            throw new Error("Not authorized to delete this slip");

        await connection.execute(
            `DELETE FROM payment_slips WHERE id = ?`,
            [slip_id]
        );

        await connection.commit();

        return res.status(200).json({
            message: "Slip deleted successfully"
        });

    } catch (err) {
        if (connection) await connection.rollback();
        return res.status(400).json({ error: err.message });
    } finally {
        if (connection) connection.release();
    }
}

async function getPendingSlips(req, res) {
    const { id: user_id } = req.user;

    try {
        const [rows] = await pool.execute(
            `SELECT * FROM payment_slips 
             WHERE to_user_id = ? 
             AND status = 'PENDING'`,
            [user_id]
        );

        return res.status(200).json(rows);
    } catch (err) {
        return res.status(500).json({ error: "Failed to fetch slips" });
    }
}

module.exports={acceptSlip,createSlip,getGroupSlips,getPendingSlips,deleteSlip,rejectSlip,editSlip};