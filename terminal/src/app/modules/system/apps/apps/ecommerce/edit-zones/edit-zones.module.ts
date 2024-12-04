import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { EditZonesComponent } from './edit-zones.component';
import { SharedModule } from '../../../../../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [EditZonesComponent],
  imports: [
    CommonModule,
    SharedModule,
    FeatherModule.pick(allIcons),
    NgbDropdownModule,
    NgxMatTimepickerModule,
    AgmCoreModule,
    NgbTooltipModule,
    DragDropModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    FlatpickrModule,
    NgSelectModule,
    NgbPaginationModule,
    NgbNavModule,
  ],
  exports: [EditZonesComponent],
})
export class EditZonesModule {}
