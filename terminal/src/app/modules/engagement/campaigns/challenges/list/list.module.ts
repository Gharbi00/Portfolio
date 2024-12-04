import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ColorPickerModule } from 'ngx-color-picker';
import { TranslateModule } from '@ngx-translate/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { FlatpickrModule } from 'angularx-flatpickr';
import { SharedModule } from '../../../../../../app/shared/shared.module';
import { ChallengeListComponent } from './list.component';

@NgModule({
  declarations: [ChallengeListComponent],
  imports: [
    FormsModule,
    NgbNavModule,
    SharedModule,
    CommonModule,
    NgSelectModule,
    TranslateModule,
    MatTooltipModule,
    NgbDropdownModule,
    ColorPickerModule,
    NgbPaginationModule,
    ReactiveFormsModule,
    FlatpickrModule.forRoot(),
  ],
})
export class ChallengesListModule {}
