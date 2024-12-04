import { NgxMaskModule } from 'ngx-mask';
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
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { MatTableModule } from '@angular/material/table';
import { SimplebarAngularModule } from 'simplebar-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatButtonModule } from '@angular/material/button';
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

import { OrdersComponent } from './orders.component';
import { OrdersListComponent } from './list/list.component';
import { SharedModule } from '../../../shared/shared.module';
import { CompanyResolver } from '../../system/company/company.resovers';
import { CommentsModule } from '../../../shared/components/comments/comments.module';
import { ProjectsResolver } from '../../collaboration/projects/projects/projects.resolver';
import { CompaniesByTargetResolver } from '../../crm/customers/companies/companies.resovers';
import { BarcodesWithStockResolver } from '../../inventory/products/articles/articles.resolvers';
import { CreateInvoicingComponent } from '../../shared/create-invoicing/create-invoicing.component';
import { InvoicingDetailsComponent } from '../../shared/detail-invoicing/detail-invoicing.component';
import { DataResolver, PricesResolver, ResetItemResolver } from '../../shared/resolvers/invoicing.resolver';
import { NotesStats, OrderCommentsResolver, OrderDetailsResolver, OrdersResolver } from './orders.resovers';
import { InvoicingDetailPageComponent } from '../../shared/detail-page-invoicing/detail-page-invoicing.component';
import { GlobalSalesTaxesResolver, ProductSalesTaxResolver, SettingsResolver } from '../../system/settings/settings.resovers';

export const routes: Route[] = [
  {
    path: '',
    component: OrdersComponent,
    children: [
      {
        path: '',
        component: OrdersListComponent,
        resolve: {
          orders: OrdersResolver,
          stats: NotesStats,
        },
      },
      {
        path: 'create',
        component: CreateInvoicingComponent,
        data: {
          type: 'sale',
          isAvoir: false,
          subType: 'order',
          pageId: 'salesOrders',
          title: 'MENUITEMS.TS.CREATE_ORDER',
          documentTitle: 'Order',
          parentPage: '/sales/orders',
          category: SequenceCategoryEnum.SALE_ORDER,
          breadCrumbItems: [{ label: 'Orders' }, { label: 'Create Order', active: true }],
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
          subType: 'order',
          pageId: 'salesOrders',
          title: 'MENUITEMS.TS.UPDATE_ORDER',
          documentTitle: 'Order',
          parentPage: '/sales/orders',
          category: SequenceCategoryEnum.SALE_ORDER,
          breadCrumbItems: [{ label: 'Orders' }, { label: 'Update Order', active: true }],
        },
        resolve: {
          data: DataResolver,
          prices: PricesResolver,
          company: CompanyResolver,
          item: OrderDetailsResolver,
          projects: ProjectsResolver,
          settings: SettingsResolver,
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
          title: 'MENUITEMS.TS.ORDER',
          isAvoir: false,
          pageId: 'saleOrders',
          subType: 'SaleOrders',
          documentTitle: 'Order',
          parentPage: '/sales/orders',
          category: SequenceCategoryEnum.SALE_ORDER,
          breadCrumbItems: [{ label: 'Orders' }, { label: 'Order Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: OrderDetailsResolver,
        },
      },
      {
        path: ':id',
        component: InvoicingDetailsComponent,
        data: {
          type: 'sale',
          title: 'MENUITEMS.TS.ORDER',
          isAvoir: false,
          pageId: 'saleOrders',
          subType: 'SaleOrders',
          documentTitle: 'Order',
          commentHolder: 'saleOrder',
          parentPage: '/sales/orders',
          commentServiceAttribute: 'order',
          commentService: 'salesOrdersService',
          category: SequenceCategoryEnum.SALE_ORDER,
          breadCrumbItems: [{ label: 'Orders' }, { label: 'Order Details', active: true }],
        },
        resolve: {
          data: DataResolver,
          item: OrderDetailsResolver,
          comments: OrderCommentsResolver,
        },
      },
    ],
  },
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [OrdersComponent, OrdersListComponent],
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
    MatIconModule,
    TranslateModule,
    NgSelectModule,
    CommentsModule,
    DragDropModule,
    MatTableModule,
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
export class OrdersModule {}
