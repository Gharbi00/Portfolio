import { DndModule } from 'ngx-drag-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
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

import { SharedModule } from '../../../../shared/shared.module';
import { DeliveryNotesListComponent } from './list/list.component';
import { DeliveryNotesComponent } from './delivery-notes.component';
import { CompanyResolver } from '../../../system/company/company.resovers';
import { CommentsModule } from '../../../../shared/components/comments/comments.module';
import { ProjectsResolver } from '../../../collaboration/projects/projects/projects.resolver';
import { CompaniesByTargetResolver } from '../../../crm/customers/companies/companies.resovers';
import { BarcodesWithStockResolver } from '../../../inventory/products/articles/articles.resolvers';
import { CreateInvoicingComponent } from '../../../shared/create-invoicing/create-invoicing.component';
import { InvoicingDetailsComponent } from '../../../shared/detail-invoicing/detail-invoicing.component';
import { DataResolver, PricesResolver, ResetItemResolver } from '../../../shared/resolvers/invoicing.resolver';
import { InvoicingDetailPageComponent } from '../../../shared/detail-page-invoicing/detail-page-invoicing.component';
import { GlobalSalesTaxesResolver, ProductSalesTaxResolver, SettingsResolver } from '../../../system/settings/settings.resovers';
import {
  DeliveryNotesResolver,
  DeliveryNotesStatsResolver,
  DeliveryNoteDetailsResolver,
  DeliveryNoteCommentsResolver,
} from './delivery-notes.resovers';

export const routes: Route[] = [
  {
    path: '',
    component: DeliveryNotesComponent,
    children: [
      {
        path: '',
        component: DeliveryNotesListComponent,
        resolve: {
          notes: DeliveryNotesResolver,
          stats: DeliveryNotesStatsResolver,
        },
      },
      {
        path: 'create',
        component: CreateInvoicingComponent,
        data: {
          type: 'sale',
          subType: 'deliveryNote',
          pageId: 'salesDeliveryNotes',
          title: 'MENUITEMS.TS.CREATE_DELIVERY_NOTE',
          documentTitle: 'Delivery Note',
          parentPage: '/sales/delivery-notes',
          category: SequenceCategoryEnum.SALE_DELIVERY_NOTE,
          breadCrumbItems: [{ label: 'Delivery note' }, { label: 'Create Delivery Note', active: true }],
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
          subType: 'deliveryNote',
          pageId: 'salesDeliveryNotes',
          title: 'MENUITEMS.TS.CREATE_DELIVERY_NOTE',
          documentTitle: 'Delivery Note',
          parentPage: '/sales/delivery-notes',
          category: SequenceCategoryEnum.SALE_DELIVERY_NOTE,
          breadCrumbItems: [{ label: 'Delivery Note' }, { label: 'Update Delivery Note', active: true }],
        },
        resolve: {
          data: DataResolver,
          prices: PricesResolver,
          company: CompanyResolver,
          projects: ProjectsResolver,
          settings: SettingsResolver,
          item: DeliveryNoteDetailsResolver,
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
          title: 'MENUITEMS.TS.DELIVERY_NOTE',
          subType: 'deliveryNote',
          documentTitle: 'Delivery Note',
          parentPage: '/sales/delivery-notes',
          pageId: 'saleDeliveryNotePageDetails',
          category: SequenceCategoryEnum.SALE_DELIVERY_NOTE,
          breadCrumbItems: [{ label: 'Delivery note' }, { label: 'Delivery note Page Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: DeliveryNoteDetailsResolver,
        },
      },
      {
        path: ':id',
        component: InvoicingDetailsComponent,
        data: {
          type: 'sale',
          title: 'MENUITEMS.TS.DELIVERY_NOTE',
          subType: 'deliveryNote',
          documentTitle: 'Delivery Note',
          pageId: 'saleDeliveryNoteDetails',
          commentHolder: 'saleDeliveryNote',
          parentPage: '/sales/delivery-notes',
          commentService: 'deliveryNotesService',
          commentServiceAttribute: 'deliveryNote',
          category: SequenceCategoryEnum.SALE_DELIVERY_NOTE,
          breadCrumbItems: [{ label: 'Delivery note' }, { label: 'Delivery note Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: DeliveryNoteDetailsResolver,
          comments: DeliveryNoteCommentsResolver,
        },
      },
    ],
  },
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [DeliveryNotesComponent, DeliveryNotesListComponent],
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
export class DeliveryNotesModule {}
