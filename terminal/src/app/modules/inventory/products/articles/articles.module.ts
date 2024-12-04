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
import { SwiperConfigInterface, SwiperModule, SWIPER_CONFIG } from 'ngx-swiper-wrapper';
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
} from '@ng-bootstrap/ng-bootstrap';

import { ArticlesComponent } from './articles.component';
import { ArticlesListComponent } from './list/list.component';
import { SharedModule } from '../../../../shared/shared.module';
import { ArticleDetailComponent } from './detail/detail.component';
import { AddArticleComponent } from './add-article/add-article.component';
import { InfiniteSuppliersResolver } from '../../../purchases/suppliers/suppliers.resovers';
import {
  AddBarcodeResolver,
  BarcodeDetailsResolver,
  BarcodeResolver,
  PriceListResolver,
  WebsiteResolver,
} from './articles.resolvers';
import { TranslationResolver } from '../../../website/content/slides/slides.resolvers';
import { InfiniteProductsResolver, UsersResolver } from '../products/products.resolver';

FullCalendarModule.registerPlugins([dayGridPlugin, interactionPlugin]);
const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  slidesPerView: 'auto',
  direction: 'horizontal',
};
const routes: Routes = [
  {
    path: '',
    component: ArticlesComponent,
    children: [
      {
        path: '',
        component: ArticlesListComponent,
        resolve: {
          articles: BarcodeResolver,
        },
      },
      {
        path: 'add',
        component: AddArticleComponent,
        resolve: {
          suppliers: InfiniteSuppliersResolver,
          barcode: AddBarcodeResolver,
          users: UsersResolver,
          products: InfiniteProductsResolver,
          translation: TranslationResolver,
        },
      },
      {
        path: 'edit/:id',
        component: AddArticleComponent,
        resolve: {
          suppliers: InfiniteSuppliersResolver,
          barcode: AddBarcodeResolver,
          users: UsersResolver,
          products: InfiniteProductsResolver,
          translation: TranslationResolver,
        },
      },
      {
        path: ':id',
        component: ArticleDetailComponent,
        resolve: {
          users: UsersResolver,
          list: PriceListResolver,
          website: WebsiteResolver,
          barcode: BarcodeDetailsResolver,
        },
      },
    ],
  },
];

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [ArticlesComponent, ArticlesListComponent, ArticleDetailComponent, AddArticleComponent],
  providers: [
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
    SwiperModule,
    PickerModule,
    CountToModule,
    MatIconModule,
    NgSelectModule,
    DragDropModule,
    MatTableModule,
    TranslateModule,
    MatCommonModule,
    NgbRatingModule,
    NgxSliderModule,
    MatSelectModule,
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
    SimplebarAngularModule,
    FlatpickrModule.forRoot(),
    // FeatherModule.pick(allIcons),
  ],
})
export class ArticlesModule {}
