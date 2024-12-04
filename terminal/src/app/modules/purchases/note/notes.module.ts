import { DndModule } from 'ngx-drag-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { CountToModule } from 'angular-count-to';
import { allIcons } from 'angular-feather/icons';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { Route, RouterModule } from '@angular/router';
import { ArchwizardModule } from 'angular-archwizard';
import { TranslateModule } from '@ngx-translate/core';
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

import { NotesComponent } from './notes.component';
import { NotesListComponent } from './list/list.component';
import { SharedModule } from '../../../shared/shared.module';
import { CompanyResolver } from '../../system/company/company.resovers';
import { CommentsModule } from '../../../shared/components/comments/comments.module';
import { ProjectsResolver } from '../../collaboration/projects/projects/projects.resolver';
import { CompaniesByTargetResolver } from '../../crm/customers/companies/companies.resovers';
import { BarcodesWithStockResolver } from '../../inventory/products/articles/articles.resolvers';
import { CreateInvoicingComponent } from '../../shared/create-invoicing/create-invoicing.component';
import { InvoicingDetailsComponent } from '../../shared/detail-invoicing/detail-invoicing.component';
import { DataResolver, PricesResolver, ResetItemResolver } from '../../shared/resolvers/invoicing.resolver';
import { InvoicingDetailPageComponent } from '../../shared/detail-page-invoicing/detail-page-invoicing.component';
import { SettingsResolver, ProductPurchasesTaxResolver, GlobalPurchasesTaxesResolver } from '../../system/settings/settings.resovers';
import { PurchaseNoteDetailsResolver, NotesResolver, PurchaseDeliveryNoteStatsResolver, PurchaseNoteCommentsResolver } from './notes.resovers';

export const routes: Route[] = [
  {
    path: '',
    component: NotesComponent,
    children: [
      {
        path: '',
        component: NotesListComponent,
        resolve: {
          notes: NotesResolver,
          state: PurchaseDeliveryNoteStatsResolver,
        },
      },
      {
        path: 'create',
        component: CreateInvoicingComponent,
        data: {
          type: 'purchase',
          subType: 'deliveryNote',
          pageId: 'purchaseNotes',
          title: 'MENUITEMS.TS.CREATE_PURCHASE_NOTE',
          documentTitle: 'Purchase Note',
          parentPage: '/purchases/notes',
          category: SequenceCategoryEnum.PURCHASE_DELIVERY_NOTE,
          breadCrumbItems: [{ label: 'Purchase Note' }, { label: 'Create Purchase Note', active: true }],
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
          subType: 'deliveryNote',
          pageId: 'purchaseNotes',
          title: 'MENUITEMS.TS.UPDATE_PRUCHASE_NOTE',
          documentTitle: 'Purchase Note',
          parentPage: '/purchases/notes',
          category: SequenceCategoryEnum.PURCHASE_DELIVERY_NOTE,
          breadCrumbItems: [{ label: 'Purchase Note' }, { label: 'Update Purchase Note', active: true }],
        },
        resolve: {
          data: DataResolver,
          prices: PricesResolver,
          company: CompanyResolver,
          projects: ProjectsResolver,
          settings: SettingsResolver,
          item: PurchaseNoteDetailsResolver,
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
          subType: 'deliveryNote',
          parentPage: '/purchases/notes',
          title: 'MENUITEMS.TS.PURCHASE_DELIVERY_NOTE',
          documentTitle: 'Purchase Delivery Note',
          pageId: 'purchaseDeliveryNotePageDetails',
          category: SequenceCategoryEnum.PURCHASE_DELIVERY_NOTE,
          breadCrumbItems: [{ label: 'Purchase Delivery Note' }, { label: 'Purchase Delivery Note Page Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: PurchaseNoteDetailsResolver,
        },
      },
      {
        path: ':id',
        component: InvoicingDetailsComponent,
        data: {
          type: 'purchase',
          subType: 'deliveryNote',
          parentPage: '/purchases/notes',
          commentService: 'notesService',
          title: 'MENUITEMS.TS.PURCHASE_DELIVERY_NOTE',
          commentServiceAttribute: 'note',
          commentHolder: 'purchaseDeliveryNote',
          pageId: 'purchaseDeliveryNoteDetails',
          documentTitle: 'Purchase Delivery Note',
          category: SequenceCategoryEnum.PURCHASE_DELIVERY_NOTE,
          breadCrumbItems: [{ label: 'Purchase Delivery Note' }, { label: 'Purchase Delivery Note Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: PurchaseNoteDetailsResolver,
          comments: PurchaseNoteCommentsResolver,
        },
      },
    ],
  },
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [NotesComponent, NotesListComponent],
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
export class NotesModule {}
