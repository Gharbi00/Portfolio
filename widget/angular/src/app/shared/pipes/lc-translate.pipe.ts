import { Pipe, PipeTransform } from '@angular/core';

// import { find, has } from 'lodash';
// import { Language } from 'models';
@Pipe({
  name: 'lcTranslate',
})
export class LcTranslatePipe implements PipeTransform {
  transform(translation: any[], target: string): any {
    // if (!translation || !translation.length) {
    //   return null;
    // }
    // const defaultLanguage = language || { code: 'EN' },
    //   foundTranslation =
    //     find(translation, ['languageCode', defaultLanguage.code]) || translation[0];
    // return foundTranslation ? foundTranslation[target] : null;
  }
}
