import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AppService {
  getWelcomeMessage(): string {
    const filePath = path.join('./public', 'html', 'WelcomeMessage.html');
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return data;
    } catch (error) {
      console.error('Error reading the file:', error);
      return 'Error loading the welcome message.';
    }
  }
}
