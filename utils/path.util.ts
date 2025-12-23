import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * สร้าง path ไปยังโฟลเดอร์ public
 * @param subPath relative path ภายใน public เช่น 'config/clients.config.json'
 */
export const getPublicPath = (customPath?: string) => {
  const safe = (customPath ?? '')
    .replace(/^\/+/, '')     // ลบ / นำหน้า
    .replace(/\\/g, '/');    // กัน backslash

  return path.join(process.cwd(), 'public', safe);
};

/**
 * อ่านไฟล์จากโฟลเดอร์ public โดยแปลงเป็น string
 * @param subPath relative path ภายใน public เช่น 'config/clients.config.json'
 */
export async function readPublicFile(subPath: string): Promise<string> {
  const fullPath = getPublicPath(subPath);
  return fs.readFile(fullPath, 'utf-8');
}

export async function readPublicJson<T = any>(subPath: string): Promise<T> {
  const fullPath = getPublicPath(subPath);
  const content = await fs.readFile(fullPath, 'utf-8');
  return JSON.parse(content);
}
