import { Component, ElementRef, Inject, OnInit, PLATFORM_ID,ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import { fadeAnimations } from '../../../shared/animations';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { LanguageService } from '../../language.service';
import { BetPagesService } from '../../../modules/bet/bet-pages.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeAnimations],
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentTime: string = '';
  hours: string = '';
  private timeSubscription: Subscription | null = null;
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
  triggerHeader: boolean = false;
  public rtl$: Observable<boolean> = this.languageService.rtl$;
  listLang = [
    { text: 'ENG', flag: 'assets/images/flags/us.svg', lang: 'en' },
    { text: 'DE', flag: 'assets/images/flags/de.svg', lang: 'de' },
    { text: 'FR', flag: 'assets/images/flags/fr.svg', lang: 'fr' },
    { text: 'العربيٌة', flag: 'assets/images/flags/sa.svg', lang: 'ar' },
  ];

  constructor(private elementRef: ElementRef,public changeDetectorRef: ChangeDetectorRef,public betService: BetPagesService, @Inject(PLATFORM_ID) protected platformId: Object,public languageService: LanguageService) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this.fadeAnimationState = entry.isIntersecting ? 'visible' : 'void';
        });
      });
      observer.observe(this.elementRef.nativeElement);
    }
    this.betService.actualBetPage$.subscribe((actualBetPage) => {
      this.currentPage = actualBetPage;
      this.changeDetectorRef.detectChanges(); 
    });
    this.timeSubscription = interval(1000).subscribe(() => {
      const now = new Date();
      this.currentTime = this.formatTime(now);
    });
  }

  ngOnDestroy(): void {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.triggerHeader = scrollPosition > 400;
  }
  formatTime(date: Date): string {
    const hours = this.padZero(date.getHours());
    const minutes = this.padZero(date.getMinutes());
    const seconds = this.padZero(date.getSeconds());
    return `${hours}:${minutes}:${seconds}`;
  }
  padZero(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
  setLanguage(lang: string /* , flag: string */) {
    /* this.flagvalue = flag; */
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
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

  currentPage: string;

  getCurrentPage(): string {
    return this.betService.getCurrentBetPage();
  }

  selectPage(betPage: string) {
    this.betService.chooseBetPage(betPage);
  }
}
