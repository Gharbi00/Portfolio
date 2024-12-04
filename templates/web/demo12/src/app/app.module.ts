import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ModulesModule } from './modules/modules.module';
import { SharedModule } from './shared/shared.module';
import { GraphQLModule } from './graphql.module';
import { GoogleMapsModule } from '@angular/google-maps';
import { EcommerceGeneratorModule } from '@sifca-monorepo/ecommerce-generator';
import { ToastrModule } from 'ngx-toastr';
import { AuthModule } from './modules/auth/auth.module';



@NgModule({
  declarations: [AppComponent],
  imports: [
   AuthModule,
    BrowserModule,
    AppRoutingModule,
    ModulesModule,
    SharedModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      progressBar: false,
      enableHtml: true,
      positionClass:'toast-top-center'
    }),
    BrowserAnimationsModule,
    GoogleMapsModule,
    GraphQLModule,
    EcommerceGeneratorModule,
  ],
  providers: [{ provide: 'ACCESS_TOKEN', useValue: 'token' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
