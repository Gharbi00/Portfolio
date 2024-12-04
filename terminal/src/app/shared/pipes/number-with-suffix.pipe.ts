import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numberWithSuffix',
})
export class NumberWithSuffixPipe implements PipeTransform {
  transform(value: number | string, currencyCode: string): string {
    let numericValue = Number(value);
    if (isNaN(numericValue)) {
      return `0 ${currencyCode}`;
    }

    const suffixes = ['', 'K', 'M', 'B', 'T'];
    let suffixIndex = 0;

    while (numericValue >= 1000 && suffixIndex < suffixes.length - 1) {
      numericValue /= 1000;
      suffixIndex++;
    }

    const numberWithSuffix = numericValue.toFixed(1) + suffixes[suffixIndex];
    return `${numberWithSuffix} ${currencyCode}`;
  }
}
