import { Route } from '@angular/router';
import { SlidesComponent } from './slides.component';
import { SlideComponent } from './list/list.component';
import { SlidesDetailsComponent } from './details/details.component';
import { SlidesDetailsResolver, SlidesResolver, TranslationResolver } from './slides.resolvers';

export const slidesRoutes: Route[] = [
  {
    path: '',
    component: SlidesComponent,
    children: [
      {
        path: '',
        component: SlideComponent,
        resolve: {
          translation: TranslationResolver,
          slides: SlidesResolver,
        },
      },
      {
        path: ':id',
        component: SlidesDetailsComponent,
        resolve: {
          details: SlidesDetailsResolver,
          translation: TranslationResolver,
        },
      },
    ],
  },
];
