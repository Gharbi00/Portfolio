import { DndModule } from 'ngx-drag-drop';
import { CountToModule } from 'angular-count-to';
import dayGridPlugin from '@fullcalendar/daygrid';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';
import { RouterModule, Routes } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import interactionPlugin from '@fullcalendar/interaction';
import { SimplebarAngularModule } from 'simplebar-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SwiperConfigInterface, SwiperModule, SWIPER_CONFIG } from 'ngx-swiper-wrapper';
import {
  NgbNavModule,
  NgbRatingModule,
  NgbTooltipModule,
  NgbDropdownModule,
  NgbCollapseModule,
  NgbTypeaheadModule,
  NgbAccordionModule,
  NgbPaginationModule,
  NgbProgressbarModule,
} from '@ng-bootstrap/ng-bootstrap';

import { ProductStructureEnum, ProductVarietyEnum } from '@sifca-monorepo/terminal-generator';

import { DataResolver } from '../inventory.resolver';
import { SharedModule } from '../../../shared/shared.module';
import { ProductsResolver } from './products/products.resolver';

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);
const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto',
};

const routes: Routes = [
  {
    path: 'products',
    resolve: { data: DataResolver, products: ProductsResolver },
    loadChildren: () => import('./products/products.module').then((m) => m.ProductsModule),
    data: {
      hasFilter: true,
      title: 'SHARED.PRODUCTS',
      pageId: 'products',
      action: 'getSimpleProductWithFilter',
      variety: ProductVarietyEnum.PRODUCT,
      parentLink: '/inventory/products/products',
      structure: [ProductStructureEnum.STOCKABLE],
      listHeader: ['#', 'SHARED.product', 'MODULES.INVENTORY.BRAND','MODULES.ECOMMERCE.MAIN.PRICE','MODULES.ECOMMERCE.MAIN.TAXES', 'MODULES.ENGAGEMENT.CREATED_AT', 'COMMON.ACTION'],
    },
    runGuardsAndResolvers: 'always',
  },
  {
    path: 'articles',
    loadChildren: () => import('./articles/articles.module').then((m) => m.ArticlesModule),
    resolve: {
      data: DataResolver,
    },
    data: {
      hasFilter: false,
      title: 'SHARED.ARTICLES',
      pageId: 'products-articles',
      variety: ProductVarietyEnum.PRODUCT,
      dropDownAction: 'getInfiniteProducts',
      parentLink: '/inventory/products/articles',
      structure: [ProductStructureEnum.STOCKABLE],
      action: 'getBarcodesWithVarietyAndStructureWithFilter',
      listHeader: ['COMMON.ARTICLE', 'MODULES.INVOICING.SHARED.BARCODE', 'SHARED.Price','MENUITEMS.TS.STOCK','COMMON.STATE.PUBLISHED' , 'COMMON.STATE.PUBLISHED', 'COMMON.ACTION'],
    },  
  },
  {
    path: 'categories',
    loadChildren: () => import('./categories/categories.module').then((m) => m.CategoriesModule),
  },
  {
    path: 'attributes',
    loadChildren: () => import('./attributes/attributes.module').then((m) => m.AttributesModule),
  },
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    DatePipe,
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG,
    },
  ],
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
    NgbRatingModule,
    NgxSliderModule,
    NgbTooltipModule,
    ArchwizardModule,
    FlexLayoutModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    FullCalendarModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    Ng2SearchPipeModule,
    NgbProgressbarModule,
    SimplebarAngularModule,
    FlatpickrModule.forRoot(),
    // FeatherModule.pick(allIcons),
  ],
})
export class ProductsModule {}
