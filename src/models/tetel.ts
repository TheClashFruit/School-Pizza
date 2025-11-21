import { ResultSetHeader } from 'mysql2/promise';
import pool from '@/util/database';
import { Tetel } from '@/util/types';

// Egy adott rendelés tételeinek törlése.
export const deleteTetelsForRendeles = async (
  id: number
): Promise<ResultSetHeader> => {
  const [result, rows] = await pool.execute(
    'DELETE FROM tetel WHERE razon = ?',
    [id]
  );

  if (rows.length <= 0) throw new Error();
  return result as ResultSetHeader;
};

// Egy adott rendelés tételeinek lekérése.
export const getTetelsForRendeles = async (
  id: number
): Promise<Tetel[] | undefined> => {
  const [result] = await pool.execute<Tetel[]>(
    'SELECT * FROM tetel WHERE razon = ?',
    [id]
  );

  return result;
};

// Új tétel felvétele.
export const createTetel = async (
  oid: number,
  pid: number,
  db: number
): Promise<ResultSetHeader> => {
  const [result] = await pool.execute(
    'INSERT INTO tetel (razon, pazon, db) VALUES (?, ?, ?)',
    [oid, pid, db]
  );

  return result as ResultSetHeader;
};

export const deleteTetel = async (oid: number, pid: number): Promise<void> => {
  const [result, rows] = await pool.execute(
    'DELETE FROM tetel WHERE razon = ?, pazon = ?',
    [oid, pid]
  );

  if (rows.length <= 0) throw new Error();
};
