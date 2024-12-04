
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignInComponent } from './sign-in/sign-in.component';
import { SignUpComponent } from './sign-up/sign-up.component';





  const routes: Routes = [
    {
        path:'login',
        component:SignInComponent,
        /* title:'Login Page' */
      },
      {
        path:'register',
        component:SignUpComponent,
        /* title:'Register Page' */
      },
      {
        path:'forgot',
        component:ForgotPasswordComponent,
        /* title:'Forgot Page' */
      },
   
  ];
  
  @NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AuthRoutingModule { }