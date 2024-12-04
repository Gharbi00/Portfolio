import { Pipe, PipeTransform } from '@angular/core';

import { padStart } from 'lodash';

import { DAY_IN_MILLISECONDS, HOUR_IN_MILLISECONDS, MINUTE_IN_MILLISECONDS, SECOND_IN_MILLISECONDS } from '../config/date.config';

@Pipe({ name: 'lcCountdown' })
export class LcCountdownPipe implements PipeTransform {
  transform(value: number): string {
    let days, hours, minutes, seconds;
    days = this.extractValue(value / DAY_IN_MILLISECONDS);
    value = value % DAY_IN_MILLISECONDS;
    hours = this.extractValue(value / HOUR_IN_MILLISECONDS);
    value = value % HOUR_IN_MILLISECONDS;
    minutes = this.extractValue(value / MINUTE_IN_MILLISECONDS);
    value = value % MINUTE_IN_MILLISECONDS;
    seconds = this.extractValue(value / SECOND_IN_MILLISECONDS);
    value = value % SECOND_IN_MILLISECONDS;
    return [days, hours, minutes, seconds].join(':');
  }

  extractValue(value: number): string {
    return padStart(`${Math.max(0, Math.floor(value))}`, 2, '0');
  }
}
