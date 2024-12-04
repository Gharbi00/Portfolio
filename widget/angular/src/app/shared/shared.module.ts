import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HighlightService } from './services/highlight.service';
import { ModalService } from './services/modal.service';

@NgModule({
  providers: [HighlightService,ModalService],
  imports: [CommonModule],
})
export class SharedModule {}
