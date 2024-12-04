import { Route } from '@angular/router';
import { PixelComponent } from './pixel.component';
import { CatalogueDetailsResolver, PixelResolver } from './pixel.resolvers';

export const pixelRoutes: Route[] = [
  {
    path: '',
    component: PixelComponent,
    resolve: {
      pixel: PixelResolver,
      plugin: CatalogueDetailsResolver,
    },
  },
];
