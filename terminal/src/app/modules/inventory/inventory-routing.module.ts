import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductVarietyEnum } from '@sifca-monorepo/terminal-generator';

import { DataResolver } from './inventory.resolver';

const routes: Routes = [
  {
    path: 'brands',
    loadChildren: () => import('./brands/brands.module').then((m) => m.BrandsModule),
  },
  {
    path: 'products',
    resolve: { data: DataResolver },
    data: { title: 'MENUITEMS.TITLE.Products', pageId: 'products', variety: ProductVarietyEnum.PRODUCT },
    loadChildren: () => import('./products/products.module').then((m) => m.ProductsModule),
  },
  {
    path: 'services',
    resolve: { data: DataResolver },
    loadChildren: () => import('./services/services.module').then((m) => m.ServicesModule),
    data: { variety: ProductVarietyEnum.SERVICE, title: 'MODULES.HR.MAIN.SERVICES', pageId: 'services' },
  },
  {
    path: 'stock',
    resolve: { data: DataResolver },
    loadChildren: () => import('./stock/stock.module').then((m) => m.StockModule),
    data: { variety: ProductVarietyEnum.PRODUCT, title: 'MENUITEMS.TITLE.STOCK', pageId: 'stock' },
  },
  {
    path: 'equipments',
    resolve: { data: DataResolver },
    data: { title: 'MENUITEMS.TITLE.EQUIPMENTS', pageId: 'equipments', variety: ProductVarietyEnum.EQUIPMENT },
    loadChildren: () => import('./equipments/equipments.module').then((m) => m.EquipmentsModule),
  },
  {
    path: 'maintenance',
    loadChildren: () => import('./maintenance/maintenance.module').then((m) => m.MaintenanceModule),
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
})
export class InventoryRoutingModule {}
