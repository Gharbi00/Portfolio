import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'purchases',
    loadChildren: () => import('./purchases/purchases.module').then((m) => m.PurchasesModule),
  },
  {
    path: 'notes',
    loadChildren: () => import('./note/notes.module').then((m) => m.NotesModule),
  },
  {
    path: 'invoices',
    loadChildren: () => import('./invoices/invoices.module').then((m) => m.InvoicesModule),
  },
  {
    path: 'suppliers',
    loadChildren: () => import('./suppliers/suppliers.module').then((m) => m.SupplierModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchaseRoutingModule {}
