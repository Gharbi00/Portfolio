import { NgxMaskModule } from 'ngx-mask';
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
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
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

import { QuotationsComponent } from './quotations.component';
import { SharedModule } from '../../../shared/shared.module';
import { CompanyResolver } from '../../system/company/company.resovers';
import { QuotationsListComponent } from './list/quotation-list.component';
import { CommentsModule } from '../../../shared/components/comments/comments.module';
import { ProjectsResolver } from '../../collaboration/projects/projects/projects.resolver';
import { CompaniesByTargetResolver } from '../../crm/customers/companies/companies.resovers';
import { BarcodesWithStockResolver } from '../../inventory/products/articles/articles.resolvers';
import { CreateInvoicingComponent } from '../../shared/create-invoicing/create-invoicing.component';
import { InvoicingDetailsComponent } from '../../shared/detail-invoicing/detail-invoicing.component';
import { DataResolver, PricesResolver, ResetItemResolver } from '../../shared/resolvers/invoicing.resolver';
import { InvoicingDetailPageComponent } from '../../shared/detail-page-invoicing/detail-page-invoicing.component';
import { GlobalSalesTaxesResolver, ProductSalesTaxResolver, SettingsResolver } from '../../system/settings/settings.resovers';
import { QuotationDetailsResolver, QuotationsResolver, QuotationsStats, QuotationsCommentsResolver } from './quotations.resovers';

export const routes: Route[] = [
  {
    path: '',
    component: QuotationsComponent,
    children: [
      {
        path: '',
        component: QuotationsListComponent,
        resolve: {
          quotations: QuotationsResolver,
          state: QuotationsStats,
        },
      },
      {
        path: 'create',
        component: CreateInvoicingComponent,
        data: {
          type: 'sale',
          isAvoir: false,
          subType: 'quotation',
          pageId: 'quotations',
          title: 'MENUITEMS.TS.CREATE_QUOTATION',
          documentTitle: 'Quotation',
          parentPage: '/sales/quotations',
          category: SequenceCategoryEnum.QUOTATION,
          breadCrumbItems: [{ label: 'Quotations' }, { label: 'Create Quotation', active: true }],
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
          subType: 'quotation',
          pageId: 'quotations',
          title: 'MENUITEMS.TS.UPDATE_QUOTATION',
          documentTitle: 'Quotation',
          parentPage: '/sales/quotations',
          category: SequenceCategoryEnum.QUOTATION,
          breadCrumbItems: [{ label: 'Quotations' }, { label: 'Update Quotation', active: true }],
        },
        resolve: {
          data: DataResolver,
          prices: PricesResolver,
          company: CompanyResolver,
          projects: ProjectsResolver,
          settings: SettingsResolver,
          item: QuotationDetailsResolver,
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
          title: 'MENUITEMS.TS.QUOTATION',
          subType: 'quotation',
          pageId: 'quotations',
          documentTitle: 'Quotation',
          parentPage: '/sales/quotations',
          category: SequenceCategoryEnum.QUOTATION,
          breadCrumbItems: [{ label: 'Quotations' }, { label: 'Quotation Details Page', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: QuotationDetailsResolver,
        },
      },
      {
        path: ':id',
        component: InvoicingDetailsComponent,
        data: {
          type: 'sale',
          isAvoir: false,
          title: 'MENUITEMS.TS.QUOTATION',
          subType: 'quotation',
          pageId: 'quotations',
          commentHolder: 'quotation',
          documentTitle: 'Quotation',
          parentPage: '/sales/quotations',
          commentService: 'quotationsService',
          commentServiceAttribute: 'quotation',
          category: SequenceCategoryEnum.QUOTATION,
          breadCrumbItems: [{ label: 'Quotations' }, { label: 'Quotation Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: QuotationDetailsResolver,
          comments: QuotationsCommentsResolver,
        },
      },
    ],
  },
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [QuotationsComponent, QuotationsListComponent],
  imports: [
    RouterModule.forChild(routes),
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    SwiperModule,
    PickerModule,
    CountToModule,
    MatIconModule,
    NgSelectModule,
    DragDropModule,
    MatTableModule,
    CommentsModule,
    TranslateModule,
    NgbRatingModule,
    NgxSliderModule,
    MatButtonModule,
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
    NgxMaskModule.forChild(),
    FlatpickrModule.forRoot(),
    FeatherModule.pick(allIcons),
  ],
})
export class QuotationsModule {}