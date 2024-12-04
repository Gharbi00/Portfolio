import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { BASE_URL } from '../../../environments/environment';
import { LanguageService } from './language.service';
import { PlayerService } from '../../modules/player/player.service';
import { find } from 'lodash';
import { PictureType, WidgetVisualsType } from '@sifca-monorepo/widget-generator';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private modalType: BehaviorSubject<string> = new BehaviorSubject('');
  private rtl: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private isHidden: BehaviorSubject<boolean> = new BehaviorSubject(true);
  private isOnboarded: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private isCompleteProfile: BehaviorSubject<boolean> = new BehaviorSubject(false);
  private activeModalSource = new BehaviorSubject<string>('home');

  baseUrl = BASE_URL;
  activeModal$ = this.activeModalSource.asObservable();
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();
  private progressBarColorSubject = new BehaviorSubject<string>('#41EFFF');
  progressBarColor$ = this.progressBarColorSubject.asObservable();

  private headerImagePathSubject = new BehaviorSubject<string>('');
  headerImagePath$ = this.headerImagePathSubject.asObservable();

  private statisticsPathSubject = new BehaviorSubject<string>('');
  statisticsPath$ = this.statisticsPathSubject.asObservable();
  darkBannerBg: PictureType;
  darkStats: PictureType;
  smallChart: PictureType;
  bannerBg: PictureType;

  get rtl$(): Observable<boolean> {
    return this.rtl.asObservable();
  }
  set rtl$(value: any) {
    this.rtl.next(value);
  }

  get isOnboarded$(): Observable<boolean> {
    return this.isOnboarded.asObservable();
  }
  set isOnboarded$(value: any) {
    this.isOnboarded.next(value);
  }

  get isCompleteProfile$(): Observable<boolean> {
    return this.isCompleteProfile.asObservable();
  }
  set isCompleteProfile$(value: any) {
    this.isCompleteProfile.next(value);
  }

  get isHidden$(): Observable<boolean> {
    return this.isHidden.asObservable();
  }
  set isHidden$(value: any) {
    this.isHidden.next(value);
  }

  get modalType$(): Observable<string> {
    return this.modalType.asObservable();
  }
  set modalType$(value: any) {
    this.modalType.next(value);
  }
  constructor(public languageService: LanguageService, private playerService: PlayerService) {
    this.playerService.widgetVisuals$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetVisuals) => {
      if (widgetVisuals) {
        this.bannerBg = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BANNER_BG').picture;
        this.smallChart = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_SMALL_CHART').picture;
        this.darkBannerBg = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_BANNER_BG_DARK').picture;
        this.darkStats = find(widgetVisuals, (item: WidgetVisualsType) => item?.reference === 'WEB_DARK_STATS').picture;
        this.headerImagePathSubject.next(this.bannerBg?.baseUrl + '/' + this.bannerBg?.path);
        this.statisticsPathSubject.next(this.smallChart?.baseUrl + '/' + this.smallChart?.path);
      }
    })
    if (this.languageService.browserLang == 'ar' || this.languageService.browserLang == 'ar-tn') {
      this.rtl.next(true);
    } else {
      this.rtl.next(false);
    }
  }

  toggleDarkMode() {
    const currentMode = this.darkModeSubject.getValue();
    this.darkModeSubject.next(!currentMode);
    if (!currentMode) {
      this.progressBarColorSubject.next('#40d04f');
      this.headerImagePathSubject.next(this.bannerBg?.baseUrl  + '/' + this.bannerBg?.path);
      this.statisticsPathSubject.next(this.darkStats?.baseUrl + '/' +  this.darkStats?.path);
    } else {
      this.progressBarColorSubject.next('#41EFFF');
      this.headerImagePathSubject.next(this.bannerBg?.baseUrl  + '/' + this.bannerBg?.path);
      this.statisticsPathSubject.next(this.smallChart?.baseUrl + '/' + this.smallChart?.path);
    }
  }

  setDarkMode(value: boolean) {
    this.darkModeSubject.next(value);
    if (value) {
      this.progressBarColorSubject.next('#40d04f');
      this.headerImagePathSubject.next(this.bannerBg?.baseUrl  + '/' + this.bannerBg?.path);
      this.statisticsPathSubject.next(this.darkStats?.baseUrl + '/' + this.darkStats?.path);
    } else {
      this.progressBarColorSubject.next('#41EFFF');
      this.headerImagePathSubject.next(this.bannerBg?.baseUrl  + '/' + this.bannerBg?.path);
      this.statisticsPathSubject.next(this.darkStats?.baseUrl + '/' + this.darkStats?.path);
    }
  }

  toggleModal(modalType: string) {
    this.isHidden.next(!this.isHidden.value);
    this.modalType.next(modalType);
  }

  toggleModalFooter(modalType: string) {
    this.modalType.next(modalType);
  }

  togglePopUp(modalName: string, element?: ElementRef): void {
    this.activeModalSource.next(modalName);
    const max = 2160;
    const progress = 80;

    if (modalName === 'profile') {
      setTimeout(() => {
        this.setStrokeDashoffset(element, '.fill', progress, max);
      }, 2000);
    }

    if (modalName === 'editProfile') {
      setTimeout(() => {
        this.setStrokeDashoffset(element, '.editFill', progress, max);
      }, 2000);
    }

    if (modalName === 'leaderboard') {
      const leaderBoardProgresses = [100, 100, 100, 100, 100, 100];
      const selectors = [
        '.fillLeaderboard1',
        '.fillLeaderboard2',
        '.fillLeaderboard3',
        '.fillLeaderboard4',
        '.fillLeaderboard5',
        '.fillLeaderboard6',
      ];

      leaderBoardProgresses.forEach((progress, index) => {
        setTimeout(() => {
          this.setStrokeDashoffset(element, selectors[index], progress, max);
        }, 1400 + index * 400);
      });
    }
  }

  private setStrokeDashoffset(element: ElementRef, selector: string, progress: number, max: number): void {
    const el = element.nativeElement.shadowRoot.querySelector(selector) as HTMLElement;
    if (el) {
      el.setAttribute('style', `stroke-dashoffset: ${((100 - progress) / 100) * max}`);
    }
  }
}
