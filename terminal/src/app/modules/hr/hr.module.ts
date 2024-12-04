import { DndModule } from 'ngx-drag-drop';
import { CountToModule } from 'angular-count-to';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArchwizardModule } from 'angular-archwizard';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { SimplebarAngularModule } from 'simplebar-angular';
import { FullCalendarModule } from '@fullcalendar/angular';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
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

import { HRRoutingModule } from './hr-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { HRSettingsComponent } from './settings/hr-settings.component';
import { PayrollComponent } from './employees/payroll/payroll.component';
import { LocationsComponent } from './company/locations/locations.component';
import { EmployeesComponent } from './employees/employees/employees.component';
import { ContractsComponent } from './employees/contracts/contracts.component';
import { VehiculeContractsComponent } from './fleet/contracts/contracts.component';
import { VehiculesComponent } from './fleet/vehicules/vehicules/vehicules.component';
import { DepartmentsComponent } from './company/departments/departments.component';
import { AddVehiculeComponent } from './fleet/vehicules/add-vehicule/add-vehicule.component';
import { VehiculeDetailComponent } from './fleet/vehicules/vehicule-detail/vehicule-detail.component';
import { DepartmentsResolver } from './company/departments/departments.resolvers';
import { LocationsResolver } from './company/locations/locations.resovers';

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  direction: 'horizontal',
  slidesPerView: 'auto',
};

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    DepartmentsResolver,
    LocationsResolver,
    DatePipe,
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG,
    },
  ],
  declarations: [
    PayrollComponent,
    EmployeesComponent,
    ContractsComponent,
    LocationsComponent,
    VehiculesComponent,
    HRSettingsComponent,
    AddVehiculeComponent,
    DepartmentsComponent,
    VehiculeDetailComponent,
    VehiculeContractsComponent,
  ],
  imports: [
    HRRoutingModule,
    TranslateModule,
    DndModule,
    FormsModule,
    CommonModule,
    SharedModule,
    NgbNavModule,
    SwiperModule,
    PickerModule,
    CountToModule,
    NgSelectModule,
    DragDropModule,
    MatTableModule,
    NgbRatingModule,
    NgxSliderModule,
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
    TranslateModule,
    SimplebarAngularModule,
    FlatpickrModule.forRoot(),
    // FeatherModule.pick(allIcons),
  ],
})
export class HRModule {}
