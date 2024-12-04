import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'elapsedTime',
})
export class ElapsedTimePipe implements PipeTransform {
  transform(executedAt: Date): string {
    const now = new Date();
    const timeDifference = now.getTime() - executedAt.getTime();

    if (timeDifference < 60000) {
      // Less than a minute
      const seconds = Math.floor(timeDifference / 1000);
      return `Just ${seconds} s ago`;
    } else if (timeDifference < 3600000) {
      // Less than an hour
      const minutes = Math.floor(timeDifference / 60000);
      return `Just ${minutes} min ago`;
    } else {
      // More than an hour, display in days
      const days = Math.floor(timeDifference / 86400000);
      return `Just ${days} days ago`;
    }
  }
}
