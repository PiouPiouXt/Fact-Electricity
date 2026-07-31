import { getDb } from '../config/database.js';
import { APPS } from '../utils/electricity.js';

export async function getCustomDevices(userId) {
  const db = getDb();
  const rows = await db.all(
    'SELECT id, name, watts, icon, created_at FROM devices WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

export async function createCustomDevice(userId, name, watts, icon = '🔌') {
  const db = getDb();
  const result = await db.run(
    'INSERT INTO devices (user_id, name, watts, icon) VALUES (?, ?, ?, ?)',
    [userId, name, watts, icon]
  );
  return { id: result.lastID, name, watts, icon };
}

export async function deleteCustomDevice(userId, deviceId) {
  const db = getDb();
  const result = await db.run(
    'DELETE FROM devices WHERE user_id = ? AND id = ?',
    [userId, deviceId]
  );
  return result.changes > 0;
}

export function getBuiltInApps() {
  return APPS.map(a => ({ id: a.id, name: a.name, watts: a.watts, icon: a.icon, priority: a.priority }));
}
