import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { fadeAnimations } from '../../../shared/animations';
import { isPlatformBrowser } from '@angular/common';
import { LanguageService } from '../../language.service';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
declare const bootstrap: any;
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeAnimations],
})
export class HeaderComponent implements OnInit {
  fadeAnimationState = 'void';
  megaMenuCollapsed = false;
  isCollapsed = false;
  private offset = 100;
  rtl: boolean;
  flagvalue: any;
  cookieValue: any;
  countryName: any;
  valueset: any;
  cookieRtl: any;

  public rtl$: Observable<boolean> = this.languageService.rtl$;
  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) protected platformId: Object,
    public languageService: LanguageService,
    public cookiesService: CookieService,
    public changeDetectorRef: ChangeDetectorRef,
  ) {
    this.cookieValue = this.cookiesService.get('lang');
    const val = this.listLang.filter((x) => x.lang === this.cookieValue);
    this.countryName = val.map((element) => element.text);
    if (val.length === 0) {
      if (this.flagvalue === undefined) {
        this.valueset = 'assets/images/flags/us.svg';
      }
    } else {
      this.flagvalue = val.map((element) => element.flag);
    }
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this.fadeAnimationState = entry.isIntersecting ? 'visible' : 'void';
        });
      });
      observer.observe(this.elementRef.nativeElement);
    }
  }

  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.svg', lang: 'en' },
    { text: 'Deutsch', flag: 'assets/images/flags/de.svg', lang: 'de' },
    { text: 'Français', flag: 'assets/images/flags/fr.svg', lang: 'fr' },
    { text: 'العربيٌة', flag: 'assets/images/flags/sa.svg', lang: 'ar' },
    { text: 'التونسي', flag: 'assets/images/flags/tn.svg', lang: 'tn' },
  ];

  setLanguage(lang: string, flag: string) {
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
    console.log('HeaderComponent', this.rtl);
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleCollapseMegaMenu() {
    this.megaMenuCollapsed = !this.megaMenuCollapsed;
  }

  scrollToSection(sectionName: string) {
    const element = document.getElementById(sectionName);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - this.offset;
      window.scrollTo({
        top: top,
        behavior: 'smooth',
      });
    }
  }
}
