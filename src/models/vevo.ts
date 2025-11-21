import { ResultSetHeader } from 'mysql2/promise';
import pool from '@/util/database';
import { Vevo } from '@/util/types';

export const getVevo = async (id: number): Promise<Vevo | undefined> => {
  const [result] = await pool.execute<Vevo[]>(
    'SELECT * FROM vevo WHERE vazon = ?',
    [id]
  );

  return result[0];
};

export const getVevos = async (): Promise<Vevo[] | undefined> => {
  const [result] = await pool.execute<Vevo[]>('SELECT * FROM vevo');

  return result;
};

export const createVevo = async (
  name: string,
  address: string
): Promise<ResultSetHeader> => {
  const [result] = await pool.execute(
    'INSERT INTO vevo (vnev, vcim) VALUE (?, ?)',
    [name, address]
  );

  return result as ResultSetHeader;
};

export const updateVevo = async (
  id: number,
  name?: string,
  address?: string
): Promise<ResultSetHeader> => {
  const updates: string[] = [];
  const values: any[] = [];

  if (name !== undefined) {
    updates.push('vnev = ?');
    values.push(name);
  }
  if (address !== undefined) {
    updates.push('vcim = ?');
    values.push(address);
  }

  values.push(id);
  const [result] = await pool.execute(
    `UPDATE vevo SET ${updates.join(', ')} WHERE vazon = ?`,
    values
  );

  return result as ResultSetHeader;
};

export const deleteVevo = async (id: number): Promise<void> => {
  const [result, rows] = await pool.execute(
    'DELETE FROM vevo WHERE vazon = ?',
    [id]
  );
  if (rows.length <= 0) throw new Error();
};
