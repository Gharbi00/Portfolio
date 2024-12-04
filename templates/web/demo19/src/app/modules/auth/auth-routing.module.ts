import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { ForgetPasswordComponent } from "./forget-password/forget-password.component";
import { LoginComponent } from "./login/login.component";
import { ProfileComponent } from "./profile/profile.component";
import { RegisterComponent } from "./register/register.component";





const routes: Routes=[
{
  path:'login',
  component:LoginComponent
},
{
  path:'forget-password',
  component:ForgetPasswordComponent
},
{
  path:'register',
  component:RegisterComponent
},
{ 
  path: 'dashboard', 
  component: DashboardComponent 
},

{ 
  path: 'profile', 
  component: ProfileComponent 
},
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class AuthRoutingModule { }