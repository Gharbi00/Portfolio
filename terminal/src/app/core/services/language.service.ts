import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  asdf;
  public languages: string[] = ['en', 'fr', 'de', 'ar', 'ru'];
  private languageSubject: BehaviorSubject<string> = new BehaviorSubject(null);
  constructor(public translate: TranslateService, private cookieService: CookieService, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      let browserLang: any;
      this.translate.addLangs(this.languages);
      if (this.cookieService.check('lang')) {
        browserLang = this.cookieService.get('lang');
      } else {
        browserLang = translate.getBrowserLang();
      }
      translate.use(browserLang.match(/en|ar|de|fr|ru|ch|it|es/) ? browserLang : 'en');
      this.languageSubject.next(browserLang.match(/en|ar|de|fr|ru|ch|it|es/) ? browserLang : 'en');
    }
  }

  get languageChanges(): Observable<string> {
    return this.languageSubject.asObservable();
  }
  set languageChanges$(value: any) {
    this.languageSubject.next(value);
  }

  public setLanguage(lang: any) {
    this.translate.use(lang);
    this.cookieService.set('lang', lang);
    this.languageSubject.next(lang);
  }
}
