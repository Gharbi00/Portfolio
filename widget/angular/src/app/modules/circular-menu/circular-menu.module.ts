import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SharedModule } from '../../shared/shared.module';
import { CircularMenuService } from './circular-menu.service';
import { CircularMenuComponent } from './circular-menu.component';

@NgModule({
  providers: [CircularMenuService],
  exports: [CircularMenuComponent],
  declarations: [CircularMenuComponent],
  imports: [
    SharedModule,
    CommonModule,
    TranslateModule,
    FlexLayoutModule,
  ],
})
export class CircularMenuModule {}
