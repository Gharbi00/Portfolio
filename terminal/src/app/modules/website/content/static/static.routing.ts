import { Route } from '@angular/router';

import { StaticResolver } from './static.resolvers';
import { StaticComponent } from './static.component';
import { StaticListComponent } from './list/list.component';
import { TranslationResolver } from '../slides/slides.resolvers';

export const StaticRoutes: Route[] = [
  {
    path: '',
    component: StaticComponent,
    children: [
      {
        path: '',
        component: StaticListComponent,
        resolve: {
          translation: TranslationResolver,
          Files: StaticResolver,
        },
      },
    ],
  },
];
