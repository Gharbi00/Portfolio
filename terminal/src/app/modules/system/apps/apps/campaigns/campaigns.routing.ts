import { Route } from '@angular/router';

import { CampaignsComponent } from './campaigns.component';
import { CampaignTypeResolver } from './campaigns.resolvers';

export const campaignsRoutes: Route[] = [
  {
    path: '',
    component: CampaignsComponent,
    resolve: {
      campaigns: CampaignTypeResolver,
    },
  },
];
