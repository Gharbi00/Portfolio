import { Route } from '@angular/router';
import { MetaCatalogComponent } from './catalog.component';
import { CatalogueDetailsResolver, CatalogueResolver } from './catalog.resolvers';

export const metaCatalogRoutes: Route[] = [
  {
    path: '',
    component: MetaCatalogComponent,
    resolve: {
      catalogue: CatalogueResolver,
      plugin: CatalogueDetailsResolver,
    },
  },
];
