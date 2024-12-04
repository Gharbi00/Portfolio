import { Route } from '@angular/router';

import { HelpdeskComponent } from './helpdesk.component';
import { HelpdeskActivityResolver } from './helpdesk.resolvers';

export const helpdeskRoutes: Route[] = [
  {
    path: '',
    component: HelpdeskComponent,
    resolve: {
      helpdesk: HelpdeskActivityResolver,
    },
  },
];
