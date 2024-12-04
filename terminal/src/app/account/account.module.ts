import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NgbCarouselModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

import { AccountRoutingModule } from './account-routing.module';
import { LoginComponent } from './auth/login/login.component';
import { PassResetComponent } from './auth/pass-reset/pass-reset.component';
import { PassCreateComponent } from './auth/pass-create/pass-create.component';
import { LockscreenComponent } from './auth/lockscreen/lockscreen.component';
import { TwoStepComponent } from './auth/twostep/twostep.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { TranslateModule } from '@ngx-translate/core';
import { SuccessMsgComponent } from './auth/success-msg/success-msg.component';
import { AuthService } from '../core/auth/auth.service';
import { AuthGuard } from '../core/auth/guards/auth.guard';
import { TerminalGeneratorModule } from '@sifca-monorepo/terminal-generator';
import { PosService } from '../core/services/pos.service';
import { UserService } from '../core/services/user.service';

@NgModule({
  providers: [AuthService, AuthGuard, PosService, UserService],
  declarations: [
    LoginComponent,
    PassResetComponent,
    PassCreateComponent,
    LockscreenComponent,
    TwoStepComponent,
    LogoutComponent,
    SuccessMsgComponent,
  ],
  imports: [TerminalGeneratorModule, CommonModule, TranslateModule, ReactiveFormsModule, FormsModule, AccountRoutingModule, NgbToastModule, CommonModule, NgbCarouselModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AccountModule {}
