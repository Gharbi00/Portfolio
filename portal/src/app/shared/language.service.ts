import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private rtlSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public rtl: Observable<boolean>;
  public currentFlag: Observable<boolean>;
  public languages: string[] = ['en', 'fr', 'ar', 'de'];
  private languageSubject: BehaviorSubject<string> = new BehaviorSubject(null);

  get languageChanges(): Observable<string> {
    return this.languageSubject.asObservable();
  }

  set languageChanges$(value: any) {
    this.languageSubject.next(value);
  }

  get rtl$(): Observable<boolean> {
    return this.rtlSubject.asObservable();
  }

  set rtl$(value: any) {
    this.rtlSubject.next(value);
  }

  constructor(public translate: TranslateService, private cookieService: CookieService, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      let browserLang: any;
      this.translate?.addLangs(this.languages);
      if (this.cookieService.check('lang')) {
        browserLang = this.cookieService.get('lang');
      } else {
        browserLang = translate.getBrowserLang();
      }
      this.setLanguage(browserLang.match(/en|fr|ar|de/) ? browserLang : 'en');
    }
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    this.cookieService.set('lang', lang);
    this.languageSubject.next(lang);
    this.rtlSubject.next(lang === 'ar');
  }
}
