import { Route } from '@angular/router';
import { VisualsComponent } from './visuals.component';
import { VisualsResolver } from './visuals.resolvers';
import { VisualsLogosComponent } from './list/logos.component';

export const iconsRoutes: Route[] = [
  {
    path: '',
    component: VisualsComponent,
    children: [
      {
        path: '',
        component: VisualsLogosComponent,
        resolve: {
          visuals: VisualsResolver,
        },
      },
    ],
  },
];
