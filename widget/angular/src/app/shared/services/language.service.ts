import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ModalService } from './modal.service';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  public currentFlag: Observable<boolean>;
  public languages: string[] = ['en-gb', 'fr-fr', 'ar-sa', 'de', 'ar-tn'];
  private languageSubject: BehaviorSubject<string> = new BehaviorSubject(null);
  browserLang: any;

  get languageChanges(): Observable<string> {
    return this.languageSubject.asObservable();
  }

  set languageChanges$(value: any) {
    this.languageSubject.next(value);
  }

  constructor(public translate: TranslateService, public modalService: ModalService, private cookieService: CookieService, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.translate?.addLangs(this.languages);
      const language = this.cookieService.get('elvkwdigtlanguage');
      this.browserLang = (window as any).widgetInit.locale || language;
      this.setLanguage(
        this.browserLang === 'fr-fr' ||
          this.browserLang === 'en-gb' ||
          this.browserLang === 'ar-sa' ||
          this.browserLang === 'ar-tn' ||
          this.browserLang === 'de'
          ? this.browserLang
          : 'en-gb',
      );
    }
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
    this.cookieService.set('lang', lang);
    this.languageSubject.next(lang);
  }
}
