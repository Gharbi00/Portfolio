import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import AOS from 'aos';
import { Observable } from 'rxjs';
import { LanguageService } from './shared/language.service';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  selectedLanguage: string = '';
  public rtl$:Observable<boolean> = this.languageService.rtl$;
  constructor(@Inject(PLATFORM_ID) protected platformId: Object,private languageService: LanguageService,translate: TranslateService,public cookiesService: CookieService) {
/*     this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (isPlatformBrowser(this.platformId)) {
        const scrollToOptions: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' };
        const element = document.documentElement;
        element.scrollIntoView(scrollToOptions);
      }
    }); */
    if (this.rtl$){
      console.log(this.rtl$,"arbic" )
    }
  }
  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      AOS.init();
    }
  }
}
