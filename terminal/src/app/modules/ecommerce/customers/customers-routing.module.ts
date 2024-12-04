import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'chat',
    loadChildren: () => import('./chat/chat.module').then((m) => m.ChatModule),
    data: {
      action: 'support',
    },
  },
  {
    path: 'customers',
    loadChildren: () => import('./customers/customers.module').then((m) => m.CustomersModule),
  },
  {
    path: 'outbound',
    loadChildren: () => import('./outbound/outbound.module').then((m) => m.OutboundModule),
  },
  {
    path: 'newsletter',
    loadChildren: () => import('./newsletter/newsletter.module').then((m) => m.NewsletterModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomersRoutingModule {}
