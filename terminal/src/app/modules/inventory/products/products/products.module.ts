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

import { DataResolver } from '../../inventory.resolver';
import { ProductsComponent } from './products.component';
import { ProductsListComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';
import { ProductDetailComponent } from './detail/detail.component';
import { AddProductComponent } from './add-product/add-product.component';
import { DownloadModalComponent } from './download/download-modal.component';
import { AddBarcodeModalComponent } from './barcode/barcode/barcode.component';
import { BarcodeAttributesModalComponent } from './barcode/barcode-attributes/barcode-attributes.component';
import {
  BrandResolver,
  UsersResolver,
  SettingsResolver,
  ProductDetailsResolver,
  ProductsCategoriesResolver,
  ResetSimpleProductResolver,
  ProductAttributesResolver,
  SearchProductsResolver,
} from './products.resolver';
import { NgxFileDropModule } from 'ngx-file-drop';
import { TranslationResolver } from '../../../website/content/slides/slides.resolvers';
import { QuillModule } from 'ngx-quill';
import { MatTooltipModule } from '@angular/material/tooltip';

export const productsRoutes: Route[] = [
  {
    path: '',
    component: ProductsComponent,
    children: [
      {
        path: '',
        component: ProductsListComponent,
      },
      {
        path: 'add',
        component: AddProductComponent,
        resolve: {
          users: UsersResolver,
          brands: BrandResolver,
          taxes: SettingsResolver,
          translation: TranslationResolver,
          create: ResetSimpleProductResolver,
          categories: ProductsCategoriesResolver,
        },
      },
      {
        path: 'edit/:id',
        component: AddProductComponent,
        data: { action: 'getSimpleProduct' },
        resolve: {
          data: DataResolver,
          users: UsersResolver,
          brands: BrandResolver,
          taxes: SettingsResolver,
          product: ProductDetailsResolver,
          translation: TranslationResolver,
          categories: ProductsCategoriesResolver,
        },
      },
      {
        path: ':id',
        component: ProductDetailComponent,
        data: { action: 'getSimpleProduct' },
        resolve: {
          data: DataResolver,
          product: ProductDetailsResolver,
        },
      },
    ],
  },
];

@NgModule({
  providers: [
    BrandResolver,
    UsersResolver,
    SettingsResolver,
    ProductsCategoriesResolver,
    ProductAttributesResolver,
    SearchProductsResolver,
    ResetSimpleProductResolver,
    ProductDetailsResolver,
  ],
  declarations: [
    ProductsComponent,
    AddProductComponent,
    ProductsListComponent,
    ProductDetailComponent,
    DownloadModalComponent,
    AddBarcodeModalComponent,
    BarcodeAttributesModalComponent,
  ],
  imports: [
    RouterModule.forChild(productsRoutes),
    DndModule,
    QuillModule,
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    SwiperModule,
    PickerModule,
    CountToModule,
    NgSelectModule,
    NgxFileDropModule,
    TranslateModule,
    DragDropModule,
    MatTableModule,
    MatCommonModule,
    MatSelectModule,
    NgbRatingModule,
    MatTooltipModule,
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
    FlatpickrModule,
  ],
})
export class ProductsModule {}
