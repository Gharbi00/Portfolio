import { DndModule } from 'ngx-drag-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { CountToModule } from 'angular-count-to';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { Route, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { ArchwizardModule } from 'angular-archwizard';
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

import { InvoicesComponent } from './invoices.component';
import { SharedModule } from '../../../shared/shared.module';
import { PurchaseInvoicesListComponent } from './list/list.component';
import { CompanyResolver } from '../../system/company/company.resovers';
import { CommentsModule } from '../../../shared/components/comments/comments.module';
import { ProjectsResolver } from '../../collaboration/projects/projects/projects.resolver';
import { CompaniesByTargetResolver } from '../../crm/customers/companies/companies.resovers';
import { BarcodesWithStockResolver } from '../../inventory/products/articles/articles.resolvers';
import { CreateInvoicingComponent } from '../../shared/create-invoicing/create-invoicing.component';
import { InvoicingDetailsComponent } from '../../shared/detail-invoicing/detail-invoicing.component';
import { DataResolver, PricesResolver, ResetItemResolver } from '../../shared/resolvers/invoicing.resolver';
import { InvoicingDetailPageComponent } from '../../shared/detail-page-invoicing/detail-page-invoicing.component';
import { SettingsResolver, GlobalPurchasesTaxesResolver, ProductPurchasesTaxResolver } from '../../system/settings/settings.resovers';
import { PurchaseInvoiceDetailsResolver, InvoicesResolver, PurchaseInvoicesStats, PurchaseInvoiceCommentsResolver } from './invoices.resovers';

export const routes: Route[] = [
  {
    path: '',
    component: InvoicesComponent,
    children: [
      {
        path: '',
        component: PurchaseInvoicesListComponent,
        resolve: {
          invoices: InvoicesResolver,
          stats: PurchaseInvoicesStats,
        },
      },
      {
        path: 'create',
        component: CreateInvoicingComponent,
        data: {
          type: 'purchase',
          subType: 'invoice',
          title: 'MENUITEMS.TS.CREATE_INVOICE',
          documentTitle: 'Invoice',
          pageId: 'purchaseInvoices',
          parentPage: '/purchases/invoices',
          category: SequenceCategoryEnum.PURCHASE_INVOICE,
          breadCrumbItems: [{ label: 'Invoice' }, { label: 'Create Invoice', active: true }],
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
          subType: 'invoice',
          title: 'MENUITEMS.TS.UPDATE_INVOICE',
          documentTitle: 'Invoice',
          pageId: 'purchaseInvoices',
          parentPage: '/purchases/invoices',
          category: SequenceCategoryEnum.PURCHASE_INVOICE,
          breadCrumbItems: [{ label: 'Invoice' }, { label: 'Update Invoice', active: true }],
        },
        resolve: {
          data: DataResolver,
          prices: PricesResolver,
          company: CompanyResolver,
          projects: ProjectsResolver,
          settings: SettingsResolver,
          barcodes: BarcodesWithStockResolver,
          item: PurchaseInvoiceDetailsResolver,
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
          subType: 'invoice',
          title: 'MENUITEMS.TS.PUCHASE_INVOICE',
          parentPage: '/purchases/invoices',
          documentTitle: 'Purchase Invoice',
          pageId: 'purchaseInvoicePageDetails',
          category: SequenceCategoryEnum.PURCHASE_INVOICE,
          breadCrumbItems: [{ label: 'Purchase Invoice' }, { label: 'Purchase Invoice Page Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: PurchaseInvoiceDetailsResolver,
        },
      },
      {
        path: ':id',
        component: InvoicingDetailsComponent,
        data: {
          type: 'purchase',
          subType: 'invoice',
          title: 'Purchase Invoice',
          commentHolder: 'purchaseInvoice',
          pageId: 'MENUITEMS.TS.PUCHASE_INVOICE',
          parentPage: '/purchases/invoices',
          documentTitle: 'Purchase Invoice',
          commentServiceAttribute: 'invoice',
          commentService: 'purchaseInvoicesService',
          category: SequenceCategoryEnum.PURCHASE_INVOICE,
          breadCrumbItems: [{ label: 'Purchase Invoice' }, { label: 'Purchase Invoice Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: PurchaseInvoiceDetailsResolver,
          comments: PurchaseInvoiceCommentsResolver,
        },
      },
    ],
  },
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [InvoicesComponent, PurchaseInvoicesListComponent],
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
    NgbRatingModule,
    NgxSliderModule,
    TranslateModule,
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
export class InvoicesModule {}
