import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { SharedModule } from "../../shared/shared.module";
import { AuthRoutingModule } from "./auth-routing.module";
import { ForgetPasswordComponent } from "./forget-password/forget-password.component";
import { LoginComponent } from "./login/login.component";
import { RegisterComponent } from "./register/register.component";
import { AuthComponent } from './auth.component';
import { ProfileComponent } from "./profile/profile.component";
import { DashboardComponent } from "./dashboard/dashboard.component";





@NgModule({
    declarations:[
        ForgetPasswordComponent,
        LoginComponent,
        RegisterComponent,
        AuthComponent,
        DashboardComponent,
        ProfileComponent,
    ],
    imports:[
        CommonModule,
        AuthRoutingModule,
        SharedModule
    ]

})
export class AuthModule {}