import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthRoutingModule } from './auth-routing.module';

import { LayoutModule } from '../../shared/layout/layout.module';
import { QuillModule } from 'ngx-quill';
import { TranslateModule } from '@ngx-translate/core';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [RegisterComponent, LoginComponent],

  imports: [CommonModule, TranslateModule, AuthRoutingModule, LayoutModule, QuillModule],
  exports: [RouterModule],
})
export class AuthModule {}
