import { NgxMaskModule } from 'ngx-mask';
import { ToastrModule } from 'ngx-toastr';
import { QuillModule } from 'ngx-quill';
import localeFr from '@angular/common/locales/fr';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FlatpickrModule } from 'angularx-flatpickr';
import { AgmCoreModule } from '@agm/core';

import { BrowserModule } from '@angular/platform-browser';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app.component';
import { GraphQLModule } from './graphql.module';
import { AppRoutingModule } from './app-routing.module';
import { AuthInterceptor } from './account/auth.interceptor';
import { HelpersModule } from '@diktup/frontend/helpers';
import { LanguageService } from './core/services/language.service';

registerLocaleData(localeFr);

export function createTranslateLoader(http: HttpClient): any {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    HelpersModule,
    FormsModule,
    BrowserModule.withServerTransition({ appId: 'elevok-terminal' }),
    GraphQLModule,
    HttpClientModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
    NgxMaskModule.forRoot(),
    FlatpickrModule.forRoot(),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDuBPYtFIzcu1rmVSupQEpPjOdhW8odjRY',
      libraries: ['places'],
    }),
    QuillModule.forRoot({
      suppressGlobalRegisterWarning: true,
    }),
    TranslateModule.forRoot({
      defaultLanguage: 'en',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    LanguageService,
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    {
      multi: true,
      useClass: AuthInterceptor,
      provide: HTTP_INTERCEPTORS,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
