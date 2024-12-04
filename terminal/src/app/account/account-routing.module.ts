import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Component Pages
// import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { PassCreateComponent } from './auth/pass-create/pass-create.component';
import { PassResetComponent } from './auth/pass-reset/pass-reset.component';
import { LockscreenComponent } from './auth/lockscreen/lockscreen.component';
import { SuccessMsgComponent } from './auth/success-msg/success-msg.component';
import { TwoStepComponent } from './auth/twostep/twostep.component';
import { LogoutComponent } from './auth/logout/logout.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  // {
  //   path: 'signup',
  //   component: SignupComponent,
  // },
  {
    path: 'pass-reset',
    component: PassResetComponent,
  },
  {
    path: 'pass-create',
    component: PassCreateComponent,
  },
  {
    path: 'lockscreen',
    component: LockscreenComponent,
  },
  {
    path: 'logout',
    component: LogoutComponent,
  },
  {
    path: 'success-msg',
    component: SuccessMsgComponent,
  },
  {
    path: 'twostep',
    component: TwoStepComponent,
  },
  // {
  //   path: 'register',
  //   component: RegisterComponent,
  // },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
