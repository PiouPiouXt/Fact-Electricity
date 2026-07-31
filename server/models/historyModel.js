import { getDb } from '../config/database.js';

export async function getAllHistory(userId) {
  const db = getDb();
  const rows = await db.all(
    `SELECT id, month, year, cost, kwh, is_auto, created_at
     FROM monthly_history
     WHERE user_id = ?
     ORDER BY year DESC, month DESC`,
    [userId]
  );
  return rows;
}

export async function addHistoryEntry(userId, month, year, cost, kwh, isAuto = false) {
  const db = getDb();
  const result = await db.run(
    `INSERT OR REPLACE INTO monthly_history (user_id, month, year, cost, kwh, is_auto)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, month, year, cost, kwh, isAuto ? 1 : 0]
  );
  return { id: result.lastID, month, year, cost, kwh, is_auto: isAuto };
}

export async function deleteHistoryEntry(userId, entryId) {
  const db = getDb();
  const result = await db.run(
    'DELETE FROM monthly_history WHERE user_id = ? AND id = ?',
    [userId, entryId]
  );
  return result.changes > 0;
}
