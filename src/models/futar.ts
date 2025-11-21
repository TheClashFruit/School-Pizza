import { ResultSetHeader } from 'mysql2/promise';
import pool from '@/util/database';
import { Futar } from '@/util/types';

export const getFutar = async (id: number): Promise<Futar | undefined> => {
  const [result] = await pool.execute<Futar[]>(
    'SELECT * FROM futar WHERE fazon = ?',
    [id]
  );

  return result[0];
};

export const getFutars = async (): Promise<Futar[] | undefined> => {
  const [result] = await pool.execute<Futar[]>('SELECT * FROM futar');

  return result;
};

export const createFutar = async (
  name: string,
  tel: string
): Promise<ResultSetHeader> => {
  const [result] = await pool.execute(
    'INSERT INTO futar (fnev, ftel) VALUE (?, ?)',
    [name, tel]
  );

  return result as ResultSetHeader;
};

export const updateFutar = async (
  id: number,
  name?: string,
  tel?: string
): Promise<ResultSetHeader> => {
  const updates: string[] = [];
  const values: any[] = [];

  if (name !== undefined) {
    updates.push('fnev = ?');
    values.push(name);
  }
  if (tel !== undefined) {
    updates.push('ftel = ?');
    values.push(tel);
  }

  values.push(id);
  const [result] = await pool.execute(
    `UPDATE futar SET ${updates.join(', ')} WHERE fazon = ?`,
    values
  );

  return result as ResultSetHeader;
};

export const deleteFutar = async (id: number): Promise<void> => {
  const [result, rows] = await pool.execute(
    'DELETE FROM futar WHERE fazon = ?',
    [id]
  );
  if (rows.length <= 0) throw new Error();
};
