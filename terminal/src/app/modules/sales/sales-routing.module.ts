import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RentalCalendarComponent } from './rental/calendar/rental-calendar.component';
import { RentalOrdersDetailsComponent } from './rental/orders/orders-details/rental-orders-details.component';
import { RentalOrdersComponent } from './rental/orders/orders/rental-orders.component';

const routes: Routes = [
  {
    path: 'quotations',
    loadChildren: () => import('./quotations/quotations.module').then((m) => m.QuotationsModule),
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then((m) => m.OrdersModule),
  },
  {
    path: 'delivery-notes',
    loadChildren: () => import('./notes/delivery/delivery-notes.module').then((m) => m.DeliveryNotesModule),
  },
  {
    path: 'issue-notes',
    loadChildren: () => import('./notes/issue/issue-notes.module').then((m) => m.IssueNotesModule),
  },
  {
    path: 'invoices',
    loadChildren: () => import('./invoices/invoices.module').then((m) => m.InvoicesModule),
  },
  {
    path: 'rental/orders',
    component: RentalOrdersComponent,
  },
  {
    path: 'rental/orders/create',
    component: RentalOrdersComponent,
  },
  {
    path: 'rental/orders/details',
    component: RentalOrdersDetailsComponent,
  },
  {
    path: 'rental/calendar',
    component: RentalCalendarComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SalesRoutingModule {}
