// src/common/code.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class CodeService {
    generateWithReadableTimestamp(prefix: string): string {
        const p = this.normalizePrefix(prefix);
        const now = new Date();

        const ts =
            now.getFullYear().toString() +
            String(now.getMonth() + 1).padStart(2, '0') +
            String(now.getDate()).padStart(2, '0') +
            String(now.getHours()).padStart(2, '0') +
            String(now.getMinutes()).padStart(2, '0') +
            String(now.getSeconds()).padStart(2, '0') +
            String(now.getMilliseconds()).padStart(3, '0');

        return `${p}${ts}`;
    }


    private normalizePrefix(prefix: string): string {
        const p = (prefix ?? '').replace(/[^a-z]/gi, '').toUpperCase();
        if (!p) {
            throw new BadRequestException('Prefix ต้องมีตัวอักษรอย่างน้อย 1 ตัว (A-Z)');
        }
        return p;
    }
}
