import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { MainInterceptor } from './main.interceptor';

@NgModule({
  imports: [CommonModule],
  providers: [{ multi: true, useClass: MainInterceptor, provide: HTTP_INTERCEPTORS }],
})
export class InterceptorsModule {}
