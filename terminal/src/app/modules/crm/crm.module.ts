import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPaginationModule, NgbTypeaheadModule, NgbTooltipModule, NgbDropdownModule, NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { CRMRoutingModule } from './crm-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ContactsComponent } from './customers/contacts/contacts.component';
import { PipelineComponent } from './pipeline/pipeline.component';
import { ArchivedComponent } from './pipeline/archived/archived.component';
import { DatePipe } from '@angular/common';
import { SortByCrmPipe } from '../crm/sort-by.pipe';
import { CompaniesComponent } from './customers/companies/companies.component';
import { LeadsComponent } from './customers/leads/leads.component';
import { CountToModule } from 'angular-count-to';
import { SimplebarAngularModule } from 'simplebar-angular';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
  declarations: [ContactsComponent, CompaniesComponent, PipelineComponent, ArchivedComponent, LeadsComponent, SortByCrmPipe],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    NgbPaginationModule,
    NgbTypeaheadModule,
    NgbTooltipModule,
    InfiniteScrollModule,
    NgbDropdownModule,
    NgbAccordionModule,
    FlatpickrModule,
    NgSelectModule,
    CRMRoutingModule,
    SharedModule,
    CountToModule,
    SimplebarAngularModule,
  ],
  providers: [DatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CrmModule {}
