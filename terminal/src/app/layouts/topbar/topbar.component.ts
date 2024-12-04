import { find, isEqual, omit } from 'lodash';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Observable, Subject, catchError, combineLatest, debounceTime, distinctUntilChanged, forkJoin, of, switchMap, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit, EventEmitter, Output, Inject, OnDestroy, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';

import { StorageHelper } from '@diktup/frontend/helpers';
import { ShortcutInput } from '@sifca-monorepo/terminal-generator';
import { AccountType, MobileThemesEnum, PointOfSaleType, ShortcutType } from '@sifca-monorepo/terminal-generator';

import { TopBarService } from './topbar.service';
import { AuthService } from '../../core/auth/auth.service';
import { feather } from '../../modules/dashboards/crm/data';
import { UserService } from '../../core/services/user.service';
import { EventService } from '../../core/services/event.service';
import { LanguageService } from '../../core/services/language.service';
import { ELEVOK_LOGO, ELEVOK_SMALL_LOGO } from '../../../environments/environment';
import { ResetApiService } from '../../core/services/reset-api.service';
import { PosService } from '../../core/services/pos.service';
import Swal from 'sweetalert2';
import { IndexService } from '../../modules/index/index.service';

@Component({
  selector: 'sifca-monorepo-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit, OnDestroy {
  @Output() mobileMenuButtonClicked = new EventEmitter();
  private unsubscribeAll: Subject<any> = new Subject<any>();

  total = 0;
  element: any;
  userData: any;
  valueset: any;
  flagvalue: any;
  userId: string;
  icons = feather;
  countryName: any;
  searchValue = '';
  cookieValue: any;
  cartLength: any = 0;
  searchedItems: any[];
  account: AccountType;
  elevokLogo = ELEVOK_LOGO;
  shortcutForm: FormGroup;
  isButtonDisabled = true;
  mode: string | undefined;
  selectedPos: PointOfSaleType;
  elevokSmallLogo = ELEVOK_SMALL_LOGO;
  shortMode: 'view' | 'modify' | 'add' | 'edit' = 'view';
  loadingItems$: Observable<boolean> = this.indexService.loadingItems$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  shortcuts$: Observable<ShortcutType[]> = this.shortcutsService.shortcuts$;
  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.svg', lang: 'en' },
    { text: 'Deutsch', flag: 'assets/images/flags/de.svg', lang: 'de' },
    { text: 'Français', flag: 'assets/images/flags/fr.svg', lang: 'fr' },
    { text: 'العربيٌة', flag: 'assets/images/flags/sa.svg', lang: 'ar' },
  ];
  isSearchButtonDisabled: boolean;

  constructor(
    @Inject(DOCUMENT) private document: any,
    private router: Router,
    private posService: PosService,
    private authService: AuthService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private storageHelper: StorageHelper,
    private eventService: EventService,
    private indexService: IndexService,
    public translate: TranslateService,
    public cookiesService: CookieService,
    private shortcutsService: TopBarService,
    public languageService: LanguageService,
    private resetApiService: ResetApiService,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.isSearchButtonDisabled = false;
          this.searchValue = searchValues?.searchString;
          this.switchItems();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe();
    combineLatest([
      this.indexService.quests$,
      this.indexService.simpleProducts$,
      this.indexService.corporateUsers$,
      this.indexService.projects$,
      this.indexService.blogs$,
      this.indexService.barcodes$,
    ]).subscribe(([res1, res2, res3, res4, res5, res6]) => {
      this.indexService.searchString = this.searchValue;
      this.searchedItems = [
        {
          items: res1,
          label: 'campaigns',
          router: 'engagement/campaigns/campaigns',
        },

        {
          items: res2,
          label: 'products',
          router: 'inventory/products/products',
        },
        ,
        {
          items: res3,
          label: 'customers',
          router: 'ecommerce/customers/customers',
        },
        ,
        {
          items: res4,
          label: 'projects',
          router: 'collaboration/projects/all',
        },
        {
          items: res5,
          label: 'blogs',
          router: 'website/blog',
        },
        {
          items: res6,
          label: 'articles',
          router: 'inventory/products/articles',
        },
      ];
      this.indexService.loadingItems$ = false;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnInit(): void {
    this.shortcutsService.getAllShortcuts().pipe(takeUntil(this.unsubscribeAll)).subscribe();
    this.shortcutForm = this.formBuilder.group({
      id: [null],
      label: ['', Validators.required],
      description: [''],
      icon: ['', Validators.required],
      link: ['', Validators.required],
      router: [false],
    });
    const initialValues = this.shortcutForm.value;
    this.shortcutForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isButtonDisabled = isEqual(initialValues, values);
    });
    this.userService.user$.subscribe((user) => {
      this.userData = user;
    });
    this.element = this.document.documentElement;
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
    this.mode = this.userData.mobileTheme.toLowerCase();
    this.getMode();
    this.authService.account$.subscribe((account) => {
      this.account = account;
      this.selectedPos = find(this.account.targets.pos, (pos) => pos?.id === this.storageHelper.getData('posId')) || this.account.targets.pos[0];
      this.changeDetectorRef.markForCheck();
    });
  }

  switchItems() {
    this.searchedItems = null;
    this.indexService.loadingItems$ = true;
    this.indexService.searchString = this.searchValue;
    forkJoin([
      this.indexService.findNonPredefinedQuestsByTarget(5),
      this.indexService.getSimpleProductWithFilter(5),
      this.indexService.searchCorporateUsersByTarget(5),
      this.indexService.getProjectsByTargetWithFilter(5),
      this.indexService.findBlogsByTargetPaginated(5),
      this.indexService.getBarcodesByTargetPaginated(5),
    ]).subscribe();
  }

  switchPos(pos: PointOfSaleType, index?: number) {
    this.selectedPos = this.account.targets.pos[index];
    this.storageHelper.setData({ company: this.account.targets.pos[index].company.id });
    this.storageHelper.setData({ posId: pos?.id });
    this.posService.setPos = pos;
    this.resetApiService.resetData();
  }

  save(): void {
    const shortcut = this.shortcutForm.value;
    const shortcutInput = omit(shortcut, 'id') as ShortcutInput;
    if (shortcut.id) {
      this.shortcutsService
        .updateShortcut(shortcut.id, shortcutInput)
        .pipe(
          catchError(() => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.shortcutsService
        .create({ ...shortcutInput, user: this.userData.id })
        .pipe(
          catchError(() => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.position();
          }
        });
    }
    this.shortMode = 'modify';
  }

  position() {
    this.translate.get('MENUITEMS.TS.WORK_SAVED').subscribe((workSaved: string) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: workSaved,
        showConfirmButton: false,
        timer: 1500,
      });
    });
  }

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  navigateByUrl(shortcut) {
    if (isPlatformBrowser(this.platformId)) {
      if (shortcut.router === true) {
        this.router.navigateByUrl(shortcut.link);
      } else {
        window.open(shortcut.link, '_blank');
      }
    }
  }

  changeShortMode(shortMode: 'view' | 'modify' | 'add' | 'edit'): void {
    this.shortMode = shortMode;
  }

  newShortcut(): void {
    this.shortcutForm.reset();
    this.shortcutForm.get('router').patchValue(false);
    this.shortMode = 'add';
  }

  editShortcut(shortcut: ShortcutType): void {
    this.shortcutForm.patchValue(shortcut);
    this.shortMode = 'edit';
  }

  toggleMobileMenu(event: any) {
    event.preventDefault();
    this.mobileMenuButtonClicked.emit();
  }

  fullscreen() {
    this.document.body.classList.toggle('fullscreen-enable');
    if (!this.document.fullscreenElement && !this.element.mozFullScreenElement && !this.element.webkitFullscreenElement) {
      if (this.element.requestFullscreen) {
        this.element.requestFullscreen();
      } else if (this.element.mozRequestFullScreen) {
        /* Firefox */
        this.element.mozRequestFullScreen();
      } else if (this.element.webkitRequestFullscreen) {
        /* Chrome, Safari and Opera */
        this.element.webkitRequestFullscreen();
      } else if (this.element.msRequestFullscreen) {
        /* IE/Edge */
        this.element.msRequestFullscreen();
      }
    } else {
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }
  }

  changeMode(mode: string) {
    this.mode = mode;
    this.eventService.broadcast('changeMode', mode);
    switch (mode) {
      case 'light':
        this.document.body.setAttribute('data-layout-mode', 'light');
        this.document.body.setAttribute('data-sidebar', 'light');
        this.userService.update({ mobileTheme: MobileThemesEnum.LIGHT }, this.userData.id).subscribe();
        break;
      case 'dark':
        this.document.body.setAttribute('data-layout-mode', 'dark');
        this.document.body.setAttribute('data-sidebar', 'dark');
        this.userService.update({ mobileTheme: MobileThemesEnum.DARK }, this.userData.id).subscribe();
        break;
      default:
        this.document.body.setAttribute('data-layout-mode', 'light');
        this.storageHelper.setData({ theme: MobileThemesEnum.LIGHT });
        break;
    }
  }

  getMode() {
    this.eventService.broadcast('changeMode', this.mode);
    switch (this.mode) {
      case 'light':
        this.document.body.setAttribute('data-layout-mode', 'light');
        this.document.body.setAttribute('data-sidebar', 'light');
        break;
      case 'dark':
        this.document.body.setAttribute('data-layout-mode', 'dark');
        this.document.body.setAttribute('data-sidebar', 'dark');
        break;
      default:
        this.document.body.setAttribute('data-layout-mode', 'light');
        break;
    }
  }

  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.cookieValue = lang;
    this.languageService.setLanguage(lang);
    // this.languageService.languageChanges$ = lang;
  }

  logout() {
    this.authService.authenticated$ = false;
    this.router.navigate(['/auth/login']);
  }

  windowScroll() {
    if (this.document.body.scrollTop > 100 || this.document.documentElement.scrollTop > 100) {
      (this.document.getElementById('back-to-top') as HTMLElement).style.display = 'block';
    } else {
      (this.document.getElementById('back-to-top') as HTMLElement).style.display = 'none';
    }
  }

  // Delete Item
  deleteItem(event: any, id: any) {
    const price = event.target.closest('.dropdown-item').querySelector('.item_price').innerHTML;
    const totalPrice = this.total - price;
    this.total = totalPrice;
    this.cartLength = this.cartLength - 1;
    this.total > 1
      ? ((this.document.getElementById('empty-cart') as HTMLElement).style.display = 'none')
      : ((this.document.getElementById('empty-cart') as HTMLElement).style.display = 'block');
    this.document.getElementById('item_' + id)?.remove();
  }

  search() {
    this.router.navigateByUrl('/');
    this.closeBtn('route');
  }

  searchBar() {
    const searchOptions = this.document.getElementById('search-close-options') as HTMLAreaElement;
    const dropdown = this.document.getElementById('search-dropdown') as HTMLAreaElement;
    const input: any = this.document.getElementById('search-options') as HTMLAreaElement;
    const filter = input.value.toUpperCase();
    const inputLength = filter.length;

    if (inputLength > 0) {
      dropdown.classList.add('show');
      searchOptions.classList.remove('d-none');
      const inputVal = input.value.toUpperCase();
      const notifyItem = this.document.getElementsByClassName('notify-item');

      Array.from(notifyItem).forEach((element: any) => {
        let notifiTxt = '';
        if (element.querySelector('h6')) {
          const spantext = element.getElementsByTagName('span')[0].innerText.toLowerCase();
          const name = element.querySelector('h6').innerText.toLowerCase();
          if (name.includes(inputVal)) {
            notifiTxt = name;
          } else {
            notifiTxt = spantext;
          }
        } else if (element.getElementsByTagName('span')) {
          notifiTxt = element.getElementsByTagName('span')[0].innerText.toLowerCase();
        }
        if (notifiTxt) {
          element.style.display = notifiTxt.includes(inputVal) ? 'block' : 'none';
        }
      });
    } else {
      dropdown.classList.remove('show');
      searchOptions.classList.add('d-none');
    }
  }

  closeBtn(field?: string) {
    const searchOptions = this.document.getElementById('search-close-options') as HTMLAreaElement;
    const dropdown = this.document.getElementById('search-dropdown') as HTMLAreaElement;
    const searchInputReponsive = this.document.getElementById('search-options') as HTMLInputElement;
    dropdown.classList.remove('show');
    searchOptions.classList.add('d-none');
    if (field !== 'route') {
      searchInputReponsive.value = '';
      this.searchForm.get('searchString').patchValue('');
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
