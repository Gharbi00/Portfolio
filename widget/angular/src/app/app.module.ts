import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppComponent } from './app.component';
import { InterceptorsModule } from './shared/interceptors/interceptors.module';
import { icons } from './modules/player/components/quests/detail/memory-game/icons';

const routes: Routes = [
  {
    path: '**',
    loadChildren: () => import('./modules/modules.module').then((m) => m.ModulesModule),
  },
];


@NgModule({
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    InterceptorsModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    FontAwesomeModule,
  ],
})
export class AppModule {
  constructor( library: FaIconLibrary) {
    library.addIcons(...icons);
  }
}
