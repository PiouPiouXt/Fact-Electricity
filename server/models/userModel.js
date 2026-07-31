import { getDb } from '../config/database.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export async function createUser(email, password, name = null) {
  const db = getDb();
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await db.run(
    'INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)',
    [email.toLowerCase(), passwordHash, name]
  );
  return { id: result.lastID, email: email.toLowerCase(), name, created_at: new Date().toISOString() };
}

export async function getUserById(id) {
  const db = getDb();
  const row = await db.get(
    'SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?',
    [id]
  );
  return row;
}

export async function getUserByEmail(email) {
  const db = getDb();
  const row = await db.get(
    'SELECT id, email, name, password_hash, created_at, updated_at FROM users WHERE email = ?',
    [email.toLowerCase()]
  );
  return row;
}

export async function userExists(email) {
  const db = getDb();
  const row = await db.get(
    'SELECT id FROM users WHERE email = ?',
    [email.toLowerCase()]
  );
  return !!row;
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
