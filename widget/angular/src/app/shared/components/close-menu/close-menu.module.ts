import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CloseMenuComponent } from './close-menu.component';
import { NzIconModule } from 'ng-zorro-antd/icon';

@NgModule({
  declarations: [CloseMenuComponent],
  imports: [CommonModule, NzIconModule],
  exports: [CloseMenuComponent],
})
export class CloseMenuModule {}
