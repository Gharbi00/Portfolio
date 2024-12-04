import { Pipe, PipeTransform } from '@angular/core';
import { includes, map } from 'lodash';

@Pipe({
  name: 'emojiFilter',
  pure: false,
})
export class EmojiFilterPipe implements PipeTransform {
  transform(items: any[], filter: any): any {
    if (!items || !filter) {
      return items;
    }
    return items.filter((item) => !includes(map(filter, 'icon'), item.icon));
  }
}
