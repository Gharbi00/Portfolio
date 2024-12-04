import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency',
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(value: number, currency: string): string {
    if (!currency) {
      return '';
    }
    let precision: number;

    switch (currency.toUpperCase()) {
      case 'TND':
        precision = 3;
        break;
      case 'EUR':
      case 'USD':
        precision = 2;
        break;
      default:
        precision = 2;
        break;
    }
    return value.toFixed(precision);
  }
}
