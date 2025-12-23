import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getUser } from 'src/utils/helpers/request.helper';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const user = getUser(req);
    if (!user) {
      throw new UnauthorizedException('No user found in request');
    }
    req['user'] = user; // เพิ่ม user เข้าไปใน req
    next();
  }
}
