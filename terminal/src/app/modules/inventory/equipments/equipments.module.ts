import { NgModule } from '@angular/core';
import { DndModule } from 'ngx-drag-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CommonModule } from '@angular/common';
import { CountToModule } from 'angular-count-to';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { TranslateModule } from '@ngx-translate/core';
import { Route, RouterModule } from '@angular/router';
import { ArchwizardModule } from 'angular-archwizard';
import { NgSelectModule } from '@ng-select/ng-select';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatTableModule } from '@angular/material/table';
import { MatCommonModule } from '@angular/material/core';
import { SimplebarAngularModule } from 'simplebar-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatSelectModule } from '@angular/material/select';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  NgbNavModule,
  NgbRatingModule,
  NgbTooltipModule,
  NgbCollapseModule,
  NgbDropdownModule,
  NgbAccordionModule,
  NgbTypeaheadModule,
  NgbPaginationModule,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap';

import { ProductStructureEnum, ProductVarietyEnum } from '@sifca-monorepo/terminal-generator';

import { DataResolver } from '../inventory.resolver';
import { SharedModule } from '../../../shared/shared.module';
import { InfiniteProductsResolver, ProductsResolver } from '../products/products/products.resolver';

export const routes: Route[] = [
  {
    path: 'equipments',
    resolve: { data: DataResolver, products: ProductsResolver },
    data: {
      hasFilter: true,
      title: 'MENUITEMS.TITLE.EQUIPMENTS',
      pageId: 'equipments',
      action: 'searchSimpleEquipments',
      variety: ProductVarietyEnum.EQUIPMENT,
      structure: [ProductStructureEnum.STOCKABLE],
      parentLink: '/inventory/equipments/equipments',
      listHeader: ['#', 'SHARED.equipment', 'MODULES.INVENTORY.BRAND', 'MODULES.ENGAGEMENT.CREATED_AT', 'COMMON.ACTION'],
    },
    loadChildren: () => import('../products/products/products.module').then((m) => m.ProductsModule),
  },
  {
    path: 'articles',
    resolve: { data: DataResolver, equipmentsProducts: InfiniteProductsResolver },
    loadChildren: () => import('../products/articles/articles.module').then((m) => m.ArticlesModule),
    data: {
      hasFilter: false,
      title: 'MENUITEMS.TITLE.ARTICLES',
      pageId: 'equipments-articles',
      structure: [ProductStructureEnum.STOCKABLE],
      parentLink: '/inventory/equipments/articles',
      dropDownAction: 'searchInfiniteSimpleEquipments',
      action: 'getBarcodesWithVarietyAndStructureWithFilter',
      listHeader: ['COMMON.ARTICLE', 'MODULES.INVOICING.SHARED.BARCODE', 'SHARED.Price','MENUITEMS.TITLE.ATTRIBUTES','MENUITEMS.TS.STOCK','COMMON.STATE.PUBLISHED' , 'COMMON.STATE.PUBLISHED', 'COMMON.ACTION'],
    },
  },
  {
    path: 'categories',
    loadChildren: () => import('../products/categories/categories.module').then((m) => m.CategoriesModule),
  },
  {
    path: 'attributes',
    loadChildren: () => import('../products/attributes/attributes.module').then((m) => m.AttributesModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    DndModule,
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    SwiperModule,
    PickerModule,
    CountToModule,
    NgSelectModule,
    DragDropModule,
    MatTableModule,
    MatCommonModule,
    TranslateModule,
    MatSelectModule,
    NgbRatingModule,
    NgxSliderModule,
    NgxBarcodeModule,
    NgbTooltipModule,
    ArchwizardModule,
    FlexLayoutModule,
    NgbDropdownModule,
    NgbCollapseModule,
    MatSnackBarModule,
    MatFormFieldModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    FullCalendarModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    Ng2SearchPipeModule,
    NgbProgressbarModule,
    SimplebarAngularModule,
    MatProgressSpinnerModule,
    FlatpickrModule.forRoot(),
  ],
})
export class EquipmentsModule {}
