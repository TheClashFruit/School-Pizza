import { ResultSetHeader } from 'mysql2/promise';
import pool from '@/util/database';
import { Pizza } from '@/util/types';

export const getPizza = async (id: number): Promise<Pizza | undefined> => {
  const [result] = await pool.execute<Pizza[]>(
    'SELECT * FROM pizza WHERE pazon = ?',
    [id]
  );

  return result[0];
};

export const getPizzas = async (): Promise<Pizza[] | undefined> => {
  const [result] = await pool.execute<Pizza[]>('SELECT * FROM pizza');

  return result;
};

export const createPizza = async (
  name: string,
  price: number
): Promise<ResultSetHeader> => {
  const [result] = await pool.execute(
    'INSERT INTO futar (pnev, par) VALUE (?, ?)',
    [name, price]
  );

  return result as ResultSetHeader;
};

export const updatePizza = async (
  id: number,
  name?: string,
  price?: number
): Promise<ResultSetHeader> => {
  const updates: string[] = [];
  const values: any[] = [];

  if (name !== undefined) {
    updates.push('pnev = ?');
    values.push(name);
  }
  if (price !== undefined) {
    updates.push('par = ?');
    values.push(price);
  }

  values.push(id);
  const [result] = await pool.execute(
    `UPDATE pizza SET ${updates.join(', ')} WHERE pazon = ?`,
    values
  );

  return result as ResultSetHeader;
};

export const deletePizza = async (id: number): Promise<void> => {
  const [result, rows] = await pool.execute(
    'DELETE FROM pizza WHERE pazon = ?',
    [id]
  );
  if (rows.length <= 0) throw new Error();
};
