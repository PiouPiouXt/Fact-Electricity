import { getDb } from '../config/database.js';

export async function getSettings(userId) {
  const db = getDb();
  const row = await db.get(
    'SELECT user_id, theme, currency, language, updated_at FROM settings WHERE user_id = ?',
    [userId]
  );
  if (!row) {
    return { theme: 'dark', currency: 'Ar', language: 'fr' };
  }
  return {
    theme: row.theme,
    currency: row.currency,
    language: row.language,
  };
}

export async function upsertSettings(userId, { theme, currency, language }) {
  const db = getDb();
  const existing = await db.get(
    'SELECT user_id FROM settings WHERE user_id = ?',
    [userId]
  );

  if (existing) {
    await db.run(
      `UPDATE settings
       SET theme = COALESCE(?, theme),
           currency = COALESCE(?, currency),
           language = COALESCE(?, language),
           updated_at = datetime('now')
       WHERE user_id = ?`,
      [theme, currency, language, userId]
    );
  } else {
    await db.run(
      `INSERT INTO settings (user_id, theme, currency, language)
       VALUES (?, COALESCE(?, 'dark'), COALESCE(?, 'Ar'), COALESCE(?, 'fr'))`,
      [userId, theme, currency, language]
    );
  }

  return await getSettings(userId);
}
