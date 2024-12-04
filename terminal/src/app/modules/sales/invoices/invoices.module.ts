import { DndModule } from 'ngx-drag-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { CountToModule } from 'angular-count-to';
import { allIcons } from 'angular-feather/icons';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { TranslateModule } from '@ngx-translate/core';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
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

import { InvoicesComponent } from './invoices.component';
import { SharedModule } from '../../../shared/shared.module';
import { InvoicesListComponent } from './list/invoice-list.component';
import { CompanyResolver } from '../../system/company/company.resovers';
import { CommentsModule } from '../../../shared/components/comments/comments.module';
import { ProjectsResolver } from '../../collaboration/projects/projects/projects.resolver';
import { CompaniesByTargetResolver } from '../../crm/customers/companies/companies.resovers';
import { BarcodesWithStockResolver } from '../../inventory/products/articles/articles.resolvers';
import { CreateInvoicingComponent } from '../../shared/create-invoicing/create-invoicing.component';
import { InvoicingDetailsComponent } from '../../shared/detail-invoicing/detail-invoicing.component';
import { InvoiceCommentsResolver, InvoiceDetailsResolver, InvoicesResolver, InvoicesStatsResolver } from './invoices.resovers';
import { DataResolver, PricesResolver, ResetItemResolver } from '../../shared/resolvers/invoicing.resolver';
import { InvoicingDetailPageComponent } from '../../shared/detail-page-invoicing/detail-page-invoicing.component';
import { GlobalSalesTaxesResolver, ProductSalesTaxResolver, SettingsResolver } from '../../system/settings/settings.resovers';

export const routes: Route[] = [
  {
    path: '',
    component: InvoicesComponent,
    children: [
      {
        path: '',
        component: InvoicesListComponent,
        resolve: {
          invoices: InvoicesResolver,
          stats: InvoicesStatsResolver,
        },
      },
      {
        path: 'create',
        component: CreateInvoicingComponent,
        data: {
          type: 'sale',
          isAvoir: false,
          subType: 'invoice',
          pageId: 'salesInvoices',
          title: 'MENUITEMS.TS.CREATE_INVOICE',
          documentTitle: 'Invoice',
          parentPage: '/sales/invoices',
          category: SequenceCategoryEnum.SALE_INVOICE,
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
          globalTaxes: GlobalSalesTaxesResolver,
          productTaxes: ProductSalesTaxResolver,
        },
      },
      {
        path: 'edit/:id',
        component: CreateInvoicingComponent,
        data: {
          type: 'sale',
          isAvoir: false,
          subType: 'invoice',
          pageId: 'salesInvoices',
          title: 'MENUITEMS.TS.UPDATE_INVOICE',
          documentTitle: 'Invoice',
          parentPage: '/sales/invoices',
          category: SequenceCategoryEnum.SALE_INVOICE,
          breadCrumbItems: [{ label: 'Invoice' }, { label: 'Update Invoice', active: true }],
        },
        resolve: {
          data: DataResolver,
          prices: PricesResolver,
          company: CompanyResolver,
          projects: ProjectsResolver,
          settings: SettingsResolver,
          item: InvoiceDetailsResolver,
          barcodes: BarcodesWithStockResolver,
          companies: CompaniesByTargetResolver,
          globalTaxes: GlobalSalesTaxesResolver,
          productTaxes: ProductSalesTaxResolver,
        },
      },
      {
        path: 'avoir/:id',
        component: CreateInvoicingComponent,
        data: {
          type: 'sale',
          isAvoir: true,
          subType: 'invoice',
          pageId: 'salesInvoices',
          title: 'MENUITEMS.TS.UPDATE_INVOICE',
          documentTitle: 'Invoice',
          parentPage: '/sales/invoices',
          category: SequenceCategoryEnum.SALE_INVOICE,
          breadCrumbItems: [{ label: 'Invoice' }, { label: 'Update Invoice', active: true }],
        },
        resolve: {
          data: DataResolver,
          prices: PricesResolver,
          company: CompanyResolver,
          projects: ProjectsResolver,
          settings: SettingsResolver,
          item: InvoiceDetailsResolver,
          barcodes: BarcodesWithStockResolver,
          companies: CompaniesByTargetResolver,
          globalTaxes: GlobalSalesTaxesResolver,
          productTaxes: ProductSalesTaxResolver,
        },
      },
      {
        path: 'page/:id',
        component: InvoicingDetailPageComponent,
        data: {
          type: 'sale',
          isAvoir: false,
          title: 'MENUITEMS.TS.INVOICE',
          subType: 'invoice',
          documentTitle: 'Invoice',
          parentPage: '/sales/invoices',
          pageId: 'saleInvoicePageDetails',
          category: SequenceCategoryEnum.SALE_INVOICE,
          breadCrumbItems: [{ label: 'Invoice' }, { label: 'Invoice Page Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: InvoiceDetailsResolver,
        },
      },
      {
        path: ':id',
        component: InvoicingDetailsComponent,
        data: {
          type: 'sale',
          isAvoir: false,
          title: 'MENUITEMS.TS.INVOICE',
          subType: 'invoice',
          documentTitle: 'Invoice',
          commentHolder: 'saleInvoice',
          pageId: 'saleInvoiceDetails',
          parentPage: '/sales/invoices',
          commentServiceAttribute: 'invoice',
          commentService: 'saleInvoicesService',
          category: SequenceCategoryEnum.SALE_INVOICE,
          breadCrumbItems: [{ label: 'Invoice' }, { label: 'Invoice Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: InvoiceDetailsResolver,
          comments: InvoiceCommentsResolver,
        },
      },
    ],
  },
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [InvoicesComponent, InvoicesListComponent],
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
    TranslateModule,
    DragDropModule,
    MatTableModule,
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
export class InvoicesModule {}
