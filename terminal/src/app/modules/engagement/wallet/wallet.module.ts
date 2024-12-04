import { DndModule } from 'ngx-drag-drop';
import { NgxBarcodeModule } from 'ngx-barcode';
import { CountToModule } from 'angular-count-to';
import dayGridPlugin from '@fullcalendar/daygrid';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { ArchwizardModule } from 'angular-archwizard';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Routes } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCommonModule } from '@angular/material/core';
import interactionPlugin from '@fullcalendar/interaction';
import { SimplebarAngularModule } from 'simplebar-angular';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FullCalendarModule } from '@fullcalendar/angular';
import { MatSelectModule } from '@angular/material/select';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SwiperConfigInterface, SWIPER_CONFIG } from 'ngx-swiper-wrapper';
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
  NgbModalModule,
} from '@ng-bootstrap/ng-bootstrap';
import { WalletComponent } from './wallet.component';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { LightboxModule } from 'ngx-lightbox';
import { NgApexchartsModule } from 'ng-apexcharts';
import { SharedModule } from '../../../shared/shared.module';
import { TopupDetailsComponent } from './topup-details/topup-details.component';
import { WalletListComponent } from './list/list.component';
import { WalletTransactionsComponent } from './transactions/transactions.component';
import { StatsResolver, TransactionsResolver, WalletResolver, WalletsResolver, WalletTopupsResolver } from './wallet.resovers';

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);
const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  slidesPerView: 'auto',
  direction: 'horizontal',
};
const routes: Routes = [
  {
    path: '',
    component: WalletComponent,
    children: [
      {
        path: '',
        component: WalletListComponent,
      },
      {
        path: 'wallet-topup',
        component: TopupDetailsComponent,
      },
      {
        path: 'transactions',
        component: WalletTransactionsComponent,
        resolve: {
          wallet: WalletsResolver,
          stats: StatsResolver,
        },
      },
    ],
  },
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [WalletComponent, TopupDetailsComponent, WalletListComponent, WalletTransactionsComponent],
  providers: [
    WalletResolver,
    TransactionsResolver,
    WalletsResolver,
    WalletTopupsResolver,
    StatsResolver,
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
    PickerModule,
    CountToModule,
    MatIconModule,
    NgSelectModule,
    DragDropModule,
    NgbModalModule,
    MatTableModule,
    TranslateModule,
    MatCommonModule,
    NgbRatingModule,
    NgxSliderModule,
    MatSelectModule,
    MatTooltipModule,
    NgxBarcodeModule,
    NgxBarcodeModule,
    NgbTooltipModule,
    ArchwizardModule,
    FlexLayoutModule,
    MatTooltipModule,
    NgbDropdownModule,
    NgbCollapseModule,
    NgbTypeaheadModule,
    NgbAccordionModule,
    FullCalendarModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    Ng2SearchPipeModule,
    NgbProgressbarModule,
    InfiniteScrollModule,
    NgxUsefulSwiperModule,
    SimplebarAngularModule,
    FlatpickrModule.forRoot(),
    LightboxModule,
    NgApexchartsModule,
    // FeatherModule.pick(allIcons),
  ],
})
export class WalletModule {}
