import { DndModule } from 'ngx-drag-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { CountToModule } from 'angular-count-to';
import { allIcons } from 'angular-feather/icons';
import { SwiperModule } from 'ngx-swiper-wrapper';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { TranslateModule } from '@ngx-translate/core';
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

import { IssueNotesComponent } from './issue-notes.component';
import { SharedModule } from '../../../../shared/shared.module';
import { IssueNotesListComponent } from './list/issue-list.component';
import { CompanyResolver } from '../../../system/company/company.resovers';
import { CommentsModule } from '../../../../shared/components/comments/comments.module';
import { ProjectsResolver } from '../../../collaboration/projects/projects/projects.resolver';
import { CompaniesByTargetResolver } from '../../../crm/customers/companies/companies.resovers';
import { BarcodesWithStockResolver } from '../../../inventory/products/articles/articles.resolvers';
import { CreateInvoicingComponent } from '../../../shared/create-invoicing/create-invoicing.component';
import { InvoicingDetailsComponent } from '../../../shared/detail-invoicing/detail-invoicing.component';
import { DataResolver, PricesResolver, ResetItemResolver } from '../../../shared/resolvers/invoicing.resolver';
import { InvoicingDetailPageComponent } from '../../../shared/detail-page-invoicing/detail-page-invoicing.component';
import { IssueNoteCommentsResolver, IssuenoteDetailsResolver, IssueNotesResolver, IssuesStats } from './issue-notes.resovers';
import { GlobalSalesTaxesResolver, ProductSalesTaxResolver, SettingsResolver } from '../../../system/settings/settings.resovers';

export const routes: Route[] = [
  {
    path: '',
    component: IssueNotesComponent,
    children: [
      {
        path: '',
        component: IssueNotesListComponent,
        resolve: {
          stats: IssuesStats,
          notes: IssueNotesResolver,
        },
      },
      {
        path: 'create',
        component: CreateInvoicingComponent,
        data: {
          type: 'sale',
          isAvoir: false,
          subType: 'issueNote',
          pageId: 'salesIssueNotes',
          title: 'MENUITEMS.TS.CREATE_ISSUE_NOTE',
          documentTitle: 'Issue Note',
          parentPage: '/sales/issue-notes',
          category: SequenceCategoryEnum.SALE_ISSUE_NOTE,
          breadCrumbItems: [{ label: 'Issue note' }, { label: 'Create Issue note', active: true }],
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
          subType: 'issueNote',
          pageId: 'salesIssueNotes',
          title: 'MENUITEMS.TS.UPDATE_ISSUE_NOTE',
          documentTitle: 'Issue Note',
          parentPage: '/sales/issue-notes',
          category: SequenceCategoryEnum.SALE_ISSUE_NOTE,
          breadCrumbItems: [{ label: 'Issue note' }, { label: 'Update Issue note', active: true }],
        },
        resolve: {
          data: DataResolver,
          prices: PricesResolver,
          company: CompanyResolver,
          projects: ProjectsResolver,
          settings: SettingsResolver,
          item: IssuenoteDetailsResolver,
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
          title: 'MENUITEMS.TS.ISSUE_NOTE',
          subType: 'issueNote',
          documentTitle: 'Issue Note',
          parentPage: '/sales/issue-notes',
          pageId: 'saleIssueNotePageDetails',
          category: SequenceCategoryEnum.SALE_ISSUE_NOTE,
          breadCrumbItems: [{ label: 'Issue note' }, { label: 'Issue note Page Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: IssuenoteDetailsResolver,
        },
      },
      {
        path: ':id',
        component: InvoicingDetailsComponent,
        data: {
          type: 'sale',
          isAvoir: false,
          title: 'Issue Note',
          subType: 'issueNote',
          documentTitle: 'MENUITEMS.TS.ISSUE_NOTE',
          pageId: 'saleIssueNoteDetails',
          commentHolder: 'saleIssueNote',
          parentPage: '/sales/issue-notes',
          commentService: 'issueNotesService',
          commentServiceAttribute: 'issueNote',
          category: SequenceCategoryEnum.SALE_ISSUE_NOTE,
          breadCrumbItems: [{ label: 'Issue note' }, { label: 'Issue note Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: IssuenoteDetailsResolver,
          comments: IssueNoteCommentsResolver,
        },
      },
    ],
  },
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [IssueNotesComponent, IssueNotesListComponent],
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
export class IssueNotesModule {}
