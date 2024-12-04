import { Route } from '@angular/router';
import { PagesComponent } from './pages.component';
import { ContentListComponent } from './list/list.component';
import { ContentDetailLandingPagesResolver, ContentLandingPagesResolver } from './pages.resolvers';
import { ContentDetailsComponent } from './details/details.component';
import { TranslationResolver } from '../slides/slides.resolvers';

export const pagesRoutes: Route[] = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: ContentListComponent,
        resolve: {
          courses: ContentLandingPagesResolver,
        },
      },
      {
        path: ':id',
        component: ContentDetailsComponent,
        resolve: {
          translation: TranslationResolver,
          courses: ContentDetailLandingPagesResolver,
        },
      },
    ],
  },
];
