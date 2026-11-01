import { Pipe, PipeTransform } from '@angular/core';

const UNITS = ['B', 'KB', 'MB', 'GB'];

@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  transform(bytes: number) {
    const index = bytes ? Math.min(Math.floor(Math.log10(bytes) / 3), 3) : 0;
    return `${+(bytes / 1000 ** index).toFixed(1)} ${UNITS[index]}`;
  }
}
