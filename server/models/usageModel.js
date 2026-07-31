import { getDb } from '../config/database.js';

export async function getDeviceTimes(userId) {
  const db = getDb();
  const rows = await db.all(
    'SELECT device_key, hours FROM device_times WHERE user_id = ?',
    [userId]
  );
  const times = {};
  rows.forEach(row => { times[row.device_key] = row.hours; });
  return times;
}

export async function saveDeviceTime(userId, deviceKey, hours) {
  const db = getDb();
  const existing = await db.get(
    'SELECT id FROM device_times WHERE user_id = ? AND device_key = ?',
    [userId, deviceKey]
  );
  if (existing) {
    await db.run(
      'UPDATE device_times SET hours = ?, updated_at = datetime(\'now\') WHERE user_id = ? AND device_key = ?',
      [hours, userId, deviceKey]
    );
  } else {
    await db.run(
      'INSERT INTO device_times (user_id, device_key, hours) VALUES (?, ?, ?)',
      [userId, deviceKey, hours]
    );
  }
  return { deviceKey, hours };
}

export async function saveAllDeviceTimes(userId, times) {
  const db = getDb();
  const keys = Object.keys(times);
  const results = [];

  for (const key of keys) {
    const hours = times[key];
    const existing = await db.get(
      'SELECT id FROM device_times WHERE user_id = ? AND device_key = ?',
      [userId, key]
    );
    if (existing) {
      await db.run(
        'UPDATE device_times SET hours = ?, updated_at = datetime(\'now\') WHERE user_id = ? AND device_key = ?',
        [hours, userId, key]
      );
    } else {
      await db.run(
        'INSERT INTO device_times (user_id, device_key, hours) VALUES (?, ?, ?)',
        [userId, key, hours]
      );
    }
    results.push({ deviceKey: key, hours });
  }

  return results;
}
