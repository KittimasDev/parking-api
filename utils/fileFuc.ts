import { HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CONFIG_PATH } from '../config/config';
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

const getRelativePath = (absolutePath: string): string => {
  const publicPath = path.join(process.cwd(), 'public');
  const relativePath = path.relative(publicPath, absolutePath);
  return '/' + relativePath.replace(/\\/g, '/');
};

const buildRelativeDirectoryPath = (customPath: string | undefined): string => {
  if (!customPath) return '';
  const cleanPath = customPath.replace(/\/+/g, '/').replace(/^\/+/, '');
  return `/${cleanPath}`;
};

const uploadBase64 = (file: UploadBase64) => {
  const { filename, base64, path: customPath } = file;
  const uploadPath = getPublicPath(customPath);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const filePath = path.join(uploadPath, filename!);

  try {
    if (!base64 || typeof base64 !== 'string') {
      throw new Error('Invalid base64 data');
    }

    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(filePath, buffer);
  } catch (error: any) {
    throw new HttpException(
      `Error writing file: ${error.message}`,
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  const relativePath = buildRelativeDirectoryPath(customPath);
  return saveFileInfo({ filename: filename!, path: relativePath });
};

const getBaseUrl = (): string => {
  return process.env.NODE_ENV === 'production'
    ? process.env.IMAGE_BASE_URL_PATH || 'https://your-production-domain.com/api'
    : process.env.NODE_ENV === 'uat'
      ? process.env.IMAGE_BASE_URL_PATH || 'https://uat-your-domain.com/api'
      : process.env.IMAGE_BASE_URL_PATH || 'http://localhost:8080/api';
};

const buildFileUrl = (baseUrl: string, relativePath: string): string => {
  if (relativePath.startsWith('/uploads')) {
    return `${baseUrl}${relativePath}`;
  }
  if (relativePath.startsWith('/')) {
    return `${baseUrl}/images${relativePath}`;
  }
  return `${baseUrl}/images/${relativePath}`;
};

const getFileBase64 = async (file: GetFileBase64) => {
  const { filename, path: customPath } = file;
  const baseUrl = getBaseUrl();

  const relativePath = customPath || `${CONFIG_PATH.PATH_COMPLAINT}/${filename}`;
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

  const url = buildFileUrl(baseUrl, filename);
  return { path_card: url, path_camera: url };
};

const getFileFuc = async (file: GetFiles) => {
  const { filename } = file;
  const baseUrl = getBaseUrl();

  if (!filename) {
    return `${baseUrl}/images/image/profile.png`;
  }

  return buildFileUrl(baseUrl, filename);
};

const getFileDashboards = (file: GetFileDashboards) => {
  const { filename, path: customPath } = file;
  const baseUrl = getBaseUrl();

  if (customPath) {
    const relativePath = customPath.includes(filename)
      ? customPath
      : `${customPath}/${filename}`;
    return buildFileUrl(baseUrl, relativePath);
  }

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

  const relativeDir = buildRelativeDirectoryPath(customPath);
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

  const fullDbPath = `${relativeDir.replace(/\/+$/, '')}/${filename.replace(/^\/+/, '')}`;

  return {
    filename,
    path: fullDbPath,
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
    if (fs.existsSync(absolutePath)) {
      const files = fs.readdirSync(absolutePath);
      for (const file of files) {
        const filePath = path.join(absolutePath, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          await deleteUploadedFiles(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      }
      fs.rmdirSync(absolutePath);
    } else {
      return;
    }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return;
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
  uploadFiles,
};
