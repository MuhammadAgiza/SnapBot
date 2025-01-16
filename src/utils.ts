// src/utils.ts
import path from 'path';
import fs from 'fs';

export function createUniqueFileName(name: string): string {
    name = path.resolve(name);
    const dir = path.dirname(name);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    const extension = path.extname(name);
    const base = path.basename(name, extension);
    return path.resolve(`${dir}/${base}-${(new Date()).toISOString()}${extension}`);
}