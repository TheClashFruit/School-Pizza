import mysql, { ResultSetHeader, RowDataPacket } from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),

  database: process.env.DB_NAME!,

  user: process.env.DB_USER!,
  password: process.env.DB_PASS!,

  connectionLimit: 10,
  idleTimeout: 10000,

  decimalNumbers: true
});

interface Futar extends RowDataPacket {
  fazon: number;
  fnev: string;
  ftel: string;
}

interface Pizza extends RowDataPacket {
  pazon: number;
  pnev: string;
  par: number;
}

export const getFutar = async (id: number): Promise<Futar | undefined> => {
  const [result] = await pool.execute<Futar[]>('SELECT * FROM futar WHERE fazon = ?', [id]);

  return result[0];
};

export const getFutars = async (): Promise<Futar[] | undefined> => {
  const [result] = await pool.execute<Futar[]>('SELECT * FROM futar');

  return result;
};

export const createFutar = async (name: string, tel: string): Promise<ResultSetHeader> => {
  const [result]  = await pool.execute('INSERT INTO futar (fnev, ftel) VALUE (?, ?)', [name,tel]);

  return (result as ResultSetHeader);
};

export const updateFutar = async (id: number, name?: string, tel?: string): Promise<ResultSetHeader> => {
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
  const [result] = await pool.execute(`UPDATE futar SET ${updates.join(', ')} WHERE fazon = ?`, values);

  return (result as ResultSetHeader);
};

export const deleteFutar = async (id: number): Promise<void> => {
  await pool.execute('DELETE FROM futar WHERE fazon = ?', [id]);
};

export const getPizza = async (id: number): Promise<Pizza | undefined> => {
  const [result] = await pool.execute<Pizza[]>('SELECT * FROM pizza WHERE pazon = ?', [id]);

  return result[0];
};

export default pool;
