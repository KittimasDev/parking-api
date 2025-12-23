import { HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CONFIG_PATH } from 'src/config/config';
import { getPublicPath } from './path.util';

export interface UploadBase64 {
  filename?: string;
  base64?: string;
  path?: string;
}
export interface GetFileBase64 {
  filename: string;
  path?: string;
}
export interface GetFiles {
  filename: string;
}
export interface GetFileDashboards {
  filename: string;
  path?: string;
}

/**
 * แปลง absolute path เป็น relative path จาก public folder
 * เช่น: C:\project\public\uploads\complaint\image.jpg -> /uploads/complaint/image.jpg
 */
const getRelativePath = (absolutePath: string): string => {
  const publicPath = path.join(process.cwd(), 'public');
  const relativePath = path.relative(publicPath, absolutePath);
  // แปลง backslash เป็น forward slash และเพิ่ม / นำหน้า
  return '/' + relativePath.replace(/\\/g, '/');
};

/**
 * สร้าง relative directory path จาก customPath
 * เช่น: customPath = '/uploads/complaint' -> '/uploads/complaint'
 * หรือ: customPath = 'uploads/complaint' -> '/uploads/complaint'
 */
const buildRelativeDirectoryPath = (customPath: string | undefined): string => {
  if (!customPath) return '';
  // ลบ / ซ้ำและทำให้แน่ใจว่ามี / นำหน้า
  const cleanPath = customPath.replace(/\/+/g, '/').replace(/^\/+/, '');
  return `/${cleanPath}`;
};

const uploadBase64 = (file: UploadBase64) => {
  const { filename, base64, path: customPath } = file;
  const uploadPath = getPublicPath(customPath);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const filePath = path.join(uploadPath, filename);

  try {
    if (!base64 || typeof base64 !== 'string') {
      throw new Error('Invalid base64 data');
    }

    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(filePath, buffer);
  } catch (error) {
    throw new HttpException(
      `Error writing file: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  // เก็บ relative directory path (ไม่รวม filename) เพื่อให้สอดคล้องกับการใช้งาน
  // เช่น: customPath = '/uploads/complaint/image' -> path = '/uploads/complaint/image'
  const relativePath = buildRelativeDirectoryPath(customPath);
  return saveFileInfo({ filename, path: relativePath });
};
/**
 * ดึง base URL ตาม environment
 */
const getBaseUrl = (): string => {
  return (
    process.env.NODE_ENV === 'production'
      ? process.env.IMAGE_BASE_URL_PATH || 'https://your-production-domain.com/api'
      : process.env.NODE_ENV === 'uat'
        ? process.env.IMAGE_BASE_URL_PATH || 'https://uat-your-domain.com/api'
        : process.env.IMAGE_BASE_URL_PATH || 'http://localhost:8080/api'
  );
};

/**
 * สร้าง URL สำหรับไฟล์จาก relative path
 * ถ้า path เริ่มด้วย /uploads ให้ใช้ /uploads โดยตรง (ไม่ต้องเพิ่ม /images)
 * ถ้าไม่ใช่ ให้เพิ่ม /images
 */
const buildFileUrl = (baseUrl: string, relativePath: string): string => {
  // ถ้า relativePath เริ่มด้วย /uploads ใช้โดยตรง (ตาม static file serving ใน main.ts)
  if (relativePath.startsWith('/uploads')) {
    return `${baseUrl}${relativePath}`;
  }
  // ถ้า relativePath เริ่มด้วย / ให้เพิ่ม /images
  if (relativePath.startsWith('/')) {
    return `${baseUrl}/images${relativePath}`;
  }
  // ถ้าไม่มี / นำหน้า ให้เพิ่ม /images/
  return `${baseUrl}/images/${relativePath}`;
};

const getFileBase64 = async (file: GetFileBase64) => {
  const { filename, path: customPath } = file;
  const baseUrl = getBaseUrl();

  // ถ้ามี customPath ใช้ customPath, ไม่เช่นนั้นใช้ CONFIG_PATH.PATH_COMPLAINT
  const relativePath = customPath || `${CONFIG_PATH.PATH_COMPLAINT}/${filename}`;

  // ตรวจสอบว่า relativePath มี filename หรือยัง
  const fullRelativePath = relativePath.includes(filename)
    ? relativePath
    : `${relativePath}/${filename}`;

  const url = buildFileUrl(baseUrl, fullRelativePath);
  return { path_card: url, path_camera: url };
};

const getFiles = async (file: GetFiles) => {
  const { filename } = file;
  const baseUrl = getBaseUrl();

  if (!filename) {
    const defaultPath = `${baseUrl}/images/image/profile.png`;
    return { path_card: defaultPath, path_camera: defaultPath };
  }

  // filename ควรเป็น relative path ที่เก็บใน DB (เช่น /uploads/complaint/image/filename.jpg)
  const url = buildFileUrl(baseUrl, filename);

  return { path_card: url, path_camera: url };
};

const getFileFuc = async (file: GetFiles) => {
  const { filename } = file;
  const baseUrl = getBaseUrl();

  if (!filename) {
    return `${baseUrl}/images/image/profile.png`;
  }

  // filename ควรเป็น relative path ที่เก็บใน DB 
  // เช่น: '/uploads/complaint/image/98811228-b5db-42b9-96a3-306a2185d8b70'
  return buildFileUrl(baseUrl, filename);
};

const getFileDashboards = (file: GetFileDashboards) => {
  const { filename, path: customPath } = file;
  const baseUrl = getBaseUrl();

  // ถ้ามี customPath ใช้ customPath, ไม่เช่นนั้นใช้ filename
  if (customPath) {
    const relativePath = customPath.includes(filename)
      ? customPath
      : `${customPath}/${filename}`;
    return buildFileUrl(baseUrl, relativePath);
  }

  // ถ้าไม่มี customPath แต่มี filename ที่เป็น relative path อยู่แล้ว
  return buildFileUrl(baseUrl, filename);
};

const uploadFiles = ({
  file,
  filename,
  customPath,
}: {
  file: Express.Multer.File;
  filename: string;
  customPath: string;
}) => {
  if (!file) {
    throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
  }

  // ✅ customPath ต้องเป็นแบบ "/uploads/emergency/image"
  const relativeDir = buildRelativeDirectoryPath(customPath); // => "/uploads/emergency/image"

  // ✅ เขียนไฟล์ลง public + relativeDir
  // getPublicPath ต้อง return ".../public" + relativeDir
  const uploadPath = getPublicPath(relativeDir);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const filePath = path.join(uploadPath, filename);

  try {
    fs.writeFileSync(filePath, file.buffer);
  } catch (error: any) {
    throw new HttpException(
      `Error saving file: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  // ✅ คืนค่าเต็มสำหรับเก็บ DB
  const fullDbPath = `${relativeDir.replace(/\/+$/, '')}/${filename.replace(/^\/+/, '')}`;

  return {
    filename,
    path: fullDbPath, // "/uploads/emergency/image/<filename>"
  };
};


const saveFileInfo = (file: { filename: string; path: string }) => {
  return {
    filename: file.filename,
    path: file.path,
  };
};
const DeleteImageFolder = (file: { folderPath: string }) => {
  const absolutePath = getPublicPath(file.folderPath);

  if (!fs.existsSync(absolutePath)) {
    throw new HttpException('Folder not found', HttpStatus.NOT_FOUND);
  }

  fs.rmSync(absolutePath, { recursive: true, force: true });
  return { message: 'Folder deleted successfully', path: file.folderPath };
};

const deleteUploadedFiles = async (directoryPath: string): Promise<void> => {
  try {
    const absolutePath = getPublicPath(directoryPath);
    // console.log(`Checking directory: ${absolutePath}`);
    if (fs.existsSync(absolutePath)) {
      // console.log(`Starting to delete directory: ${absolutePath}`);
      const files = fs.readdirSync(absolutePath);
      for (const file of files) {
        const filePath = path.join(absolutePath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          await deleteUploadedFiles(filePath);
        } else {
          fs.unlinkSync(filePath);
          // console.log(`Deleted file: ${filePath}`);
        }
      }

      fs.rmdirSync(absolutePath);
      console.log(`Deleted Successfully`);
    } else {
      console.log(`Directory does not exist: ${absolutePath}`);
      // ไม่ throw error แต่ return เฉยๆ
      return;
    }
  } catch (error) {
    console.error(`Error deleting files in ${directoryPath}:`, error);

    // เพิ่มการตรวจสอบว่า error เป็นเพราะ directory ไม่มีอยู่หรือไม่
    if (error.code === 'ENOENT') {
      console.log(`Directory already removed or does not exist: ${directoryPath}`);
      return; // ไม่ throw error หาก directory ไม่มีอยู่
    }

    throw new HttpException(
      `Error deleting directory: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
};

export {
  DeleteImageFolder,
  deleteUploadedFiles,
  getFileBase64,
  getFileDashboards,
  getFileFuc,
  getFiles,
  uploadBase64,
  uploadFiles
};

