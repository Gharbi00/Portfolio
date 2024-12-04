import AOS from 'aos';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from './shared/language.service';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  selectedLanguage: string = '';
  public rtl$: Observable<boolean> = this.languageService.rtl$;

  constructor(
    private router: Router,
    public cookiesService: CookieService,
    @Inject(PLATFORM_ID) protected platformId: Object,
    private languageService: LanguageService,
    translate: TranslateService,
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (isPlatformBrowser(this.platformId)) {
        const scrollToOptions: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' };
        const element = document.documentElement;
        element.scrollIntoView(scrollToOptions);
      }
    });
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init();
    }
  }
  onLanguageChanged(newLanguage: string) {
    this.selectedLanguage = newLanguage;
  }
}
