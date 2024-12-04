import { reduce } from 'lodash';
import { Observable, of } from 'rxjs';
import { map as rxMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { TranslationAppEnum } from '@sifca-monorepo/widget-generator';

type FetchPolicy = 'cache-first' | 'network-only';

export class GraphQLTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient) {}
  private cache: Record<string, any> = {};

  getTranslation(lang: string, fetchPolicy: FetchPolicy = 'cache-first'): Observable<any> {
    const query = `
      query getStaticTranslationsByTargetAndLanguage($app: TranslationAppEnum!, $target: TargetACIInput!, $language: ID, $languageCode: String) {
        getStaticTranslationsByTargetAndLanguage(
        target: $target
        language: $language
        languageCode: $languageCode
        app:$app
        ) {
          id
           reference
            translation {
              content
              language {
                name
                code
                id
              }
            }
        }
      }
    `;

    const variables = {
      languageCode: lang || (window as any).widgetInit.locale,
      target: { pos: (window as any).widgetInit.appId },
      app: TranslationAppEnum.WIDGET_WEB,
    };

    const cacheKey = JSON.stringify({ query, variables });

    if (fetchPolicy === 'cache-first' && this.cache[cacheKey]) {
      return of(this.cache[cacheKey]); // Return cached data as an observable
    }

    return this.http
      .post(
        'https://sfca-sbx-bck.diktup.cloud/graphql',
        {
          query,
          variables,
        },
      )
      .pipe(
        rxMap((response: any) => {
          return reduce(
            response.data.getStaticTranslationsByTargetAndLanguage,
            (accumulator: any, current) => {
              accumulator[current.reference] = current.translation[0].content;
              return accumulator;
            },
            {},
          );
        }),
      );
  }
}
