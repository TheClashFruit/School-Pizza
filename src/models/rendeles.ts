import { ResultSetHeader } from 'mysql2/promise';
import pool from '@/util/database';
import { Rendeles } from '@/util/types';
import { deleteTetelsForRendeles } from '@/models/tetel';

export const getRendeles = async (
  id: number
): Promise<Rendeles | undefined> => {
  const [result] = await pool.execute<Rendeles[]>(
    'SELECT * FROM rendeles WHERE razon = ?',
    [id]
  );

  return result[0];
};

export const getRendelesek = async (): Promise<Rendeles[] | undefined> => {
  const [result] = await pool.execute<Rendeles[]>('SELECT * FROM rendeles');

  return result;
};

export const newRendeles = async (
  vid: number,
  fid: number
): Promise<ResultSetHeader> => {
  const [result] = await pool.execute(
    'INSERT INTO rendeles (vazon, fazon, idopont) VALUES (?, ?, ?)',
    [vid, fid, new Date()]
  );

  return result as ResultSetHeader;
};

export const deleteRendeles = async (id: number): Promise<ResultSetHeader> => {
  await deleteTetelsForRendeles(id);
  const [result, rows] = await pool.execute(
    'DELETE FROM rendeles WHERE razon = ?',
    [id]
  );

  if (rows.length <= 0) throw new Error();
  return result as ResultSetHeader;
};
