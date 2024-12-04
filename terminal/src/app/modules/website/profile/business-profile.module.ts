import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { RouterModule } from '@angular/router';
import { BusinessProfileComponent } from './business-profile.component';
import { businessProfileRoutes } from './business-profile.routing';
import { UploadHelper } from '@diktup/frontend/helpers';
import { SharedModule } from '../../../shared/shared.module';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAccordionModule, NgbDropdownModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { FlatpickrModule } from 'angularx-flatpickr';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { NgxUsefulSwiperModule } from 'ngx-useful-swiper';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { QuillModule } from 'ngx-quill';
import { ProfilePaymentMethodResolver, ProfileResolver, ProfileSocialsResolver } from './business-profile.resolvers';

@NgModule({
  declarations: [BusinessProfileComponent],
  imports: [
    RouterModule.forChild(businessProfileRoutes),
    FormsModule,
    QuillModule,
    CommonModule,
    NgbNavModule,
    SharedModule,
    AgmCoreModule,
    NgSelectModule,
    TranslateModule,
    FlatpickrModule,
    NgbTooltipModule,
    NgbDropdownModule,
    NgbAccordionModule,
    Ng2SearchPipeModule,
    ReactiveFormsModule,
    NgxUsefulSwiperModule,
    NgxMatTimepickerModule,
  ],
  providers: [ProfileResolver, ProfileSocialsResolver, ProfilePaymentMethodResolver, UploadHelper],
})
export class BusinessProfileModule {}
