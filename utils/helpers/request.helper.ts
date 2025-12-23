import { Request } from 'express';
export interface JwtPayload {
  userId: number;
  username: string;
}

/**
 * ดึง Authorization Token จาก Header
 */
export const getToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
};

/**
 * ดึง user จาก req.user พร้อม type-safe
 */
export const getUser = (req: Request): JwtPayload | null => {
  if (!req.user) return { userId: null, username: null };
  const user = req.user as JwtPayload;
  return user;
};

export const getRequestToken = (req: Request): string | null => {
  const token = getToken(req);
  return token || null;
};

export const getRequestUser = (req: Request): JwtPayload => {
  const user = getUser(req);
  return user;
};
