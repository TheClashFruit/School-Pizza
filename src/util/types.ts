import { RowDataPacket } from 'mysql2/promise';

export interface Futar extends RowDataPacket {
  fazon: number;
  fnev: string;
  ftel: string;
}

export interface Pizza extends RowDataPacket {
  pazon: number;
  pnev: string;
  par: number;
}

export interface Vevo extends RowDataPacket {
  vazon: number;
  vnev: string;
  vcim: string;
}

export interface Rendeles extends RowDataPacket {
  razon: number;
  vazon: number;
  fazon: number;
  idopont: Date;
}

export interface Tetel extends RowDataPacket {
  razon: number;
  pazon: number;
  db: number;
}
