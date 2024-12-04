import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LcTranslatePipe } from './lc-translate.pipe';
import { LcCountdownPipe } from './lc-countdown.pipe';
import { SafePipe } from './safe.pipe';

@NgModule({
  declarations: [LcTranslatePipe, LcCountdownPipe, SafePipe],
  imports: [CommonModule],
  exports: [LcTranslatePipe, LcCountdownPipe],
})
export class PipesModule {}
