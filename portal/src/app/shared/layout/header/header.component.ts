import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { fadeAnimations } from '../../../shared/animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LanguageService } from '../../language.service';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeAnimations],
})
export class HeaderComponent implements OnInit {
  rtl: boolean;
  flagvalue: any;
  cookieValue: any;
  countryName: any;
  valueset: any;
  cookieRtl: any;
  isCollapsed = false;
  megaMenuCollapsed = false;
  public rtl$: Observable<boolean> = this.languageService.rtl$;

  constructor(
    public modalService: NgbModal,
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
  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.svg', lang: 'en' },
    { text: 'Deutsch', flag: 'assets/images/flags/de.svg', lang: 'de' },
    { text: 'Français', flag: 'assets/images/flags/fr.svg', lang: 'fr' },
    { text: 'العربيٌة', flag: 'assets/images/flags/sa.svg', lang: 'ar' },
  ];
  setLanguage(lang: string, flag: string) {
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
    console.log('HeaderComponent', this.rtl);
  }

  ngOnInit(): void {
    if (this.cookieValue === 'ar') {
      this.rtl = true;
    }
    console.log('HeaderComponent', this.rtl);
  }

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleCollapseMegaMenu() {
    this.megaMenuCollapsed = !this.megaMenuCollapsed;
  }

  openContactModal(content: any) {
    this.modalService.open(content, { centered: true });
  }
}
