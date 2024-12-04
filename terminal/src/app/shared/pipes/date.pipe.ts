import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardDate',
})
export class CardDatePipe implements PipeTransform {
  transform(updatedAt: string): number {
    const updatedDate = new Date(updatedAt);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - updatedDate.getTime();
    const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    return daysPassed;
  }
}
