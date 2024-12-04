import { DndModule } from 'ngx-drag-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { CountToModule } from 'angular-count-to';
import { allIcons } from 'angular-feather/icons';
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
import { SimplebarAngularModule } from 'simplebar-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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

import { SequenceCategoryEnum } from '@sifca-monorepo/terminal-generator';

import { PurchasesComponent } from './purchases.component';
import { SharedModule } from '../../../shared/shared.module';
import { PurchasesListComponent } from './list/list.component';
import { CompanyResolver } from '../../system/company/company.resovers';
import { CommentsModule } from '../../../shared/components/comments/comments.module';
import { ProjectsResolver } from '../../collaboration/projects/projects/projects.resolver';
import { CompaniesByTargetResolver } from '../../crm/customers/companies/companies.resovers';
import { PurchaseCommentsResolver, PurchaseDetailsResolver, PurchaseStats, PurchasesResolver } from './purchases.resovers';
import { BarcodesWithStockResolver } from '../../inventory/products/articles/articles.resolvers';
import { CreateInvoicingComponent } from '../../shared/create-invoicing/create-invoicing.component';
import { InvoicingDetailsComponent } from '../../shared/detail-invoicing/detail-invoicing.component';
import { DataResolver, PricesResolver, ResetItemResolver } from '../../shared/resolvers/invoicing.resolver';
import { InvoicingDetailPageComponent } from '../../shared/detail-page-invoicing/detail-page-invoicing.component';
import { SettingsResolver, GlobalPurchasesTaxesResolver, ProductPurchasesTaxResolver } from '../../system/settings/settings.resovers';

export const routes: Route[] = [
  {
    path: '',
    component: PurchasesComponent,
    children: [
      {
        path: '',
        component: PurchasesListComponent,
        resolve: {
          stats: PurchaseStats,
          purchases: PurchasesResolver,
        },
      },
      {
        path: 'create',
        component: CreateInvoicingComponent,
        data: {
          type: 'purchase',
          subType: 'order',
          pageId: 'purchaseOrders',
          title: 'MENUITEMS.TS.CREATE_PURCHASE',
          documentTitle: 'Purchase',
          parentPage: '/purchases/purchases',
          category: SequenceCategoryEnum.PURCHASE_ORDER,
          breadCrumbItems: [{ label: 'Purchase' }, { label: 'Create Purchase', active: true }],
        },
        resolve: {
          data: DataResolver,
          prices: PricesResolver,
          company: CompanyResolver,
          create: ResetItemResolver,
          projects: ProjectsResolver,
          settings: SettingsResolver,
          barcodes: BarcodesWithStockResolver,
          companies: CompaniesByTargetResolver,
          globalTaxes: GlobalPurchasesTaxesResolver,
          productTaxes: ProductPurchasesTaxResolver,
        },
      },
      {
        path: 'edit/:id',
        component: CreateInvoicingComponent,
        data: {
          type: 'purchase',
          subType: 'order',
          pageId: 'purchaseOrders',
          title: 'MENUITEMS.TS.UPDATE_PURCHASE',
          documentTitle: 'Purchase',
          parentPage: '/purchases/purchases',
          category: SequenceCategoryEnum.PURCHASE_ORDER,
          breadCrumbItems: [{ label: 'Purchase' }, { label: 'Update Purchase', active: true }],
        },
        resolve: {
          data: DataResolver,
          prices: PricesResolver,
          company: CompanyResolver,
          projects: ProjectsResolver,
          settings: SettingsResolver,
          item: PurchaseDetailsResolver,
          barcodes: BarcodesWithStockResolver,
          companies: CompaniesByTargetResolver,
          globalTaxes: GlobalPurchasesTaxesResolver,
          productTaxes: ProductPurchasesTaxResolver,
        },
      },
      {
        path: 'page/:id',
        component: InvoicingDetailPageComponent,
        data: {
          type: 'purchase',
          title: 'Purchase',
          subType: 'order',
          documentTitle: 'MENUITEMS.TS.PURCHASE_ORDER',
          parentPage: '/purchases/purchases',
          pageId: 'purchaseOrdersPageDetails',
          category: SequenceCategoryEnum.PURCHASE_ORDER,
          breadCrumbItems: [{ label: 'Purchase' }, { label: 'Purchase Page Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: PurchaseDetailsResolver,
        },
      },
      {
        path: ':id',
        component: InvoicingDetailsComponent,
        data: {
          type: 'purchase',
          title: 'MENUITEMS.TS.PURCHASE',
          subType: 'order',
          commentHolder: 'purchaseOrder',
          documentTitle: 'Purchase Order',
          pageId: 'purchaseOrdersDetails',
          commentService: 'purchasesService',
          parentPage: '/purchases/purchases',
          commentServiceAttribute: 'purchase',
          category: SequenceCategoryEnum.PURCHASE_ORDER,
          breadCrumbItems: [{ label: 'Purchase' }, { label: 'Purchase Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: PurchaseDetailsResolver,
          comments: PurchaseCommentsResolver,
        },
      },
    ],
  },
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [PurchasesComponent, PurchasesListComponent],
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
    CommentsModule,
    DragDropModule,
    MatTableModule,
    TranslateModule,
    NgbRatingModule,
    NgxSliderModule,
    NgxBarcodeModule,
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
    FeatherModule.pick(allIcons),
  ],
})
export class PurchasesModule {}
