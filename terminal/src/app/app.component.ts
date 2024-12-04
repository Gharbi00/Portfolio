import { map } from 'rxjs';
import lottie from 'lottie-web';
import { filter } from 'rxjs/operators';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { defineElement } from '@lordicon/element';

import { SharedService } from './shared/services/shared.service';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'sifca-monorepo',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  selectedLanguage: string = '';

  constructor(
    private router: Router,
    private sharedService: SharedService,
    private languageService: LanguageService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.languageService.languageChanges.subscribe((lang) => {
      this.selectedLanguage = lang;
      this.affectRtl();
    });
    if (isPlatformBrowser(this.platformId)) {
      defineElement(lottie.loadAnimation);
    }
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd),
        map((event) => {
          if (event instanceof NavigationStart) {
            this.sharedService.navigating$ = true;
          }
          if (event instanceof NavigationEnd) {
            this.sharedService.navigating$ = false;
          }
          return event;
        }),
      )
      .subscribe();
  }

  onLanguageChanged(newLanguage: string) {
    this.selectedLanguage = newLanguage;
  }

  affectRtl() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.selectedLanguage === 'ar') {
        const link = this.document.createElement('link');
        link.href = 'rtl.css';
        link.id = 'rtl';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        this.document.head.appendChild(link);
      } else {
        const elem = this.document.querySelector('#rtl');
        if (elem) {
          elem.remove();
        }
      }
    }
  }
}
