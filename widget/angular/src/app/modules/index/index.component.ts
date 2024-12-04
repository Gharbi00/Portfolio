import { Howl } from 'howler';
import Swal from 'sweetalert2';
import isAfter from 'date-fns/isAfter';
import parseISO from 'date-fns/parseISO';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds';
import { map, find, chain, times, random, sortBy, forEach, trimStart, findIndex, intersection, some } from 'lodash';
import { Subject, of, switchMap, takeUntil, throwError, map as rxMap, combineLatest, Observable, take } from 'rxjs';
import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, PLATFORM_ID, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';

import { AppCookieService, StorageHelper } from '@diktup/frontend/helpers';
import {
  UserType,
  UserStatus,
  ListenForNewMessageGQL,
  ListenForAmountPushedEventGQL,
  ListenForUserLoggedInByTargetGQL,
  ListenForUserLoggedOutByTargetGQL,
  ListenForNewAdhocCorporateNotificationGQL,
  ListenForSendThemAndLanguageToWidgetGQL,
  ProfileCompletnessProgressType,
  PositionEnum,
} from '@sifca-monorepo/widget-generator';
import { SaveCurrentCorporateUserStatusGQL } from '@sifca-monorepo/widget-generator';
import { WidgetIntegrationType, QuestWithRepeatDateType } from '@sifca-monorepo/widget-generator';

import { PlayerService } from '../player/player.service';
import { ModalService } from '../../shared/services/modal.service';
import { LanguageService } from '../../shared/services/language.service';
import { ACCESS_TOKEN, BASE_URL } from '../../../environments/environment';
import { HighlightService } from '../../shared/services/highlight.service';
import { CircularMenuService } from '../circular-menu/circular-menu.service';
import { ProfileService } from '../player/components/profile/profile.service';
import { fadeAnimations, hightlightActivity } from '../../shared/animations/animations';
import { CustomQuestStatus } from '../player/components/reputation/custom-quest-status';
import { NotificationsService } from '../player/components/notification/notifications.service';

declare const FB: any;

@Component({
  selector: 'index-component',
  animations: [hightlightActivity, fadeAnimations],
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './index.component.html',
  styles: [
    `
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      .widget-animation {
        -webkit-animation: slide-bck-right 0.45s cubic-bezier(0.47, 0, 0.745, 0.715) both;
        animation: slide-bck-right 0.45s cubic-bezier(0.47, 0, 0.745, 0.715) both;
        animation-delay: 5s;
        &:hover {
          animation: 0;
          transition: all 1s;
        }
      }
      .widget-animation-left {
        -webkit-animation: slide-bck-left 0.45s cubic-bezier(0.47, 0, 0.745, 0.715) both;
        animation: slide-bck-left 0.45s cubic-bezier(0.47, 0, 0.745, 0.715) both;
        animation-delay: 5s;
        &:hover {
          animation: 0;
          transition: all 0.5s;
        }
      }

      .widget-animation-mobile {
        -webkit-animation: slide-bck-right-mobile 0.45s cubic-bezier(0.47, 0, 0.745, 0.715) both;
        animation: slide-bck-right-mobile 0.45s cubic-bezier(0.47, 0, 0.745, 0.715) both;
        animation-delay: 5s;
        &:hover {
          animation: 0;
          transition: all 1s;
        }
      }
      .widget-animation-left-mobile {
        -webkit-animation: slide-bck-left-mobile 0.45s cubic-bezier(0.47, 0, 0.745, 0.715) both;
        animation: slide-bck-left-mobile 0.45s cubic-bezier(0.47, 0, 0.745, 0.715) both;
        animation-delay: 5s;
        &:hover {
          animation: 0;
          transition: all 0.5s;
        }
      }
      @-webkit-keyframes slide-bck-right-mobile {
        0% {
          opacity: 1;
          -webkit-transform: translateZ(0) translateX(0);
          transform: translateZ(0) translateX(0);
        }
        100% {
          opacity: 0.6;
          -webkit-transform: translateZ(-40px) translateX(10px) scale(0.9);
          transform: translateZ(-40px) translateX(10px) scale(0.9);
        }
      }
      @keyframes slide-bck-right-mobile {
        0% {
          opacity: 1;
          -webkit-transform: translateZ(0) translateX(0);
          transform: translateZ(0) translateX(0);
        }
        100% {
          opacity: 0.6;
          -webkit-transform: translateZ(-40px) translateX(10px) scale(0.9);
          transform: translateZ(-40px) translateX(10px) scale(0.9);
        }
      }
      @-webkit-keyframes slide-bck-left-mobile {
        0% {
          opacity: 1;
          -webkit-transform: translateZ(0) translateX(0);
          transform: translateZ(0) translateX(0);
        }
        100% {
          opacity: 0.6;
          -webkit-transform: translateZ(-40px) translateX(-10px) scale(0.9);
          transform: translateZ(-40px) translateX(-10px) scale(0.9);
        }
      }
      @keyframes slide-bck-left-mobile {
        0% {
          opacity: 1;
          -webkit-transform: translateZ(0) translateX(0);
          transform: translateZ(0) translateX(0);
        }
        100% {
          opacity: 0.6;
          -webkit-transform: translateZ(-40px) translateX(-10px) scale(0.9);
          transform: translateZ(-40px) translateX(-10px) scale(0.9);
        }
      }

      .sticky-button {
        position: -webkit-sticky; /* For Safari */
        position: sticky;
        bottom: 341px;
        transform: rotate(-90deg);
        transform-origin: left bottom;
        margin: 20px;
      }

      div.close-zone {
        z-index: 5000000;
        position: fixed;
        width: 100%;
        top: 80%;
        bottom: 0px;
        background: rgb(255, 255, 255);
        background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(0, 0, 0, 0.5) 100%);
        -webkit-animation: slide-fwd-top 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        animation: slide-fwd-top 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        div.icon-close {
          display: flex;
          justify-content: center;
          align-items: center;
          -webkit-animation: slide-fwd-top 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
          animation: slide-fwd-top 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
      }
      .wrap-background {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.6);
        z-index: 999;
      }
      @-webkit-keyframes slide-fwd-top {
        0% {
          -webkit-transform: translateZ(160px) translateY(100px);
          transform: translateZ(160px) translateY(100px);
        }
        100% {
          -webkit-transform: translateZ(0) translateY(0);
          transform: translateZ(0) translateY(0);
        }
      }
      @keyframes slide-fwd-top {
        0% {
          -webkit-transform: translateZ(160px) translateY(100px);
          transform: translateZ(160px) translateY(100px);
        }
        100% {
          -webkit-transform: translateZ(0) translateY(0);
          transform: translateZ(0) translateY(0);
        }
      }
      .profile-cnt {
        position: relative;
      }
      .profile-image {
        width: 120px;
        height: 120px;

        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
        animation: clipRotateAnim 2s linear infinite;
        position: relative;
        overflow: hidden;
      }

      .profile-image:before {
        content: '';
        position: absolute;
        top: 10%;
        bottom: -10%;
        left: 0%;
        right: 0%;
        background: var(--i) center / cover;
        animation: inherit;
        animation-direction: reverse;
      }

      .progress {
        width: 120px;
        height: 120px;
        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
      }
      .progress .track,
      .progress .fill {
        fill: rgba(0, 0, 0, 0);
        stroke-width: 80;
        transform: translate(75px, 685px) rotate(-90deg);
      }
      .progress .track {
        stroke: rgb(56, 71, 83);
      }
      .progress .fill {
        stroke: rgb(255, 255, 255);
        stroke-linecap: round;
        stroke-dasharray: 2160;
        stroke-dashoffset: 2160;
        transition: stroke-dashoffset 1s;
      }
      .progress.blue .fill {
        stroke: rgb(104, 214, 198);
      }

      .progress-bar {
        position: absolute;
        top: 0;
      }

      .widget-container {
        position: relative;
      }

      .modal-container {
        position: absolute;
        top: 50%;
        left: 100%;
        transform: translateY(-50%);
        z-index: 1000;
        width: 300px;
      }

      .modal-content {
        background-color: #fff;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
      }
      @-webkit-keyframes slide-bck-left {
        0% {
          opacity: 1;
          -webkit-transform: translateZ(0) translateX(0);
          transform: translateZ(0) translateX(0);
        }

        100% {
          opacity: 0.8;
          -webkit-transform: translateZ(-40px) translateX(-20px) scale(0.9);
          transform: translateZ(-40px) translateX(-20px) scale(0.9);
        }
      }

      @keyframes slide-bck-left {
        0% {
          opacity: 1;
          -webkit-transform: translateZ(0) translateX(0);
          transform: translateZ(0) translateX(0);
        }

        100% {
          opacity: 0.8;
          -webkit-transform: translateZ(-40px) translateX(-20px) scale(0.9);
          transform: translateZ(-40px) translateX(-20px) scale(0.9);
        }
      }

      @-webkit-keyframes slide-bck-right {
        0% {
          opacity: 1;
          -webkit-transform: translateZ(0) translateX(0);
          transform: translateZ(0) translateX(0);
        }

        100% {
          opacity: 0.8;
          -webkit-transform: translateZ(-40px) translateX(0px) scale(0.9);
          transform: translateZ(-40px) translateX(0px) scale(0.9);
        }
      }

      @keyframes slide-bck-right {
        0% {
          opacity: 1;
          -webkit-transform: translateZ(0) translateX(0);
          transform: translateZ(0) translateX(0);
        }

        100% {
          opacity: 0.8;
          -webkit-transform: translateZ(-40px) translateX(0px) scale(0.9);
          transform: translateZ(-40px) translateX(0px) scale(0.9);
        }
      }
      .swal2-html-container {
        font-size: 16px !important;
      }
      .swal2-title {
        font-size: 30px !important;
      }
    `,
  ],
})
export class IndexComponent implements OnInit {
  @ViewChild('widget') widget!: ElementRef;
  @ViewChild('onboarding') onboarding!: ElementRef;

  private activitiesTargets;
  private observer: MutationObserver;
  private activitiesClasses: string[];
  private bodyMutationObserver: MutationObserver;
  private unsubscribeAll: Subject<any> = new Subject<any>();

  posId: string;
  embed: string;
  isOpen = false;
  nextLevel: any;
  ipAddress: any;
  widgetInit: any;
  loginUrl: string;
  position: number;
  isMobile: boolean;
  modalType: string;
  isLoaded: boolean;
  currentLevel: any;
  darkMode: boolean;
  activityTypes: any;
  questColor: string;
  direction = 'right';
  activeModal: string;
  elvkwdigtref: string;
  isHiddenMenu = false;
  hightlightCoords: any;
  questDuration: number;
  hasCountDown: boolean;
  guestModeopen = false;
  currentUser: UserType;
  isFinalLevel: boolean;
  ishoveringArea = false;
  authenticated: boolean;
  questStatusText: string;
  reputationLevels: any[];
  alignment: PositionEnum;
  selectedLanguage: string;
  isIPaddressExist: boolean;
  closeButtonVisible = false;
  highlighting: boolean = false;
  questStatus: CustomQuestStatus;
  requestStopHighlighting: boolean;
  quests: QuestWithRepeatDateType[];
  widgetSettings: WidgetIntegrationType;
  highlightedActivity: QuestWithRepeatDateType;
  isHidden$: Observable<boolean> = this.modalService.isHidden$;
  isOnboarded$: Observable<boolean> = this.modalService.isOnboarded$;
  completeProfile$: Observable<ProfileCompletnessProgressType> = this.profileService.completeProfile$;
  walletPushedNotification$: Observable<boolean> = this.circularMenuService.walletPushedNotification$;

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private translate: TranslateService,
    protected modalService: ModalService,
    private storageHelper: StorageHelper,
    protected playerService: PlayerService,
    private languageService: LanguageService,
    protected profileService: ProfileService,
    private deviceInfo: DeviceDetectorService,
    private appCookieService: AppCookieService,
    protected highlightService: HighlightService,
    private changeDetectorRef: ChangeDetectorRef,
    private circularMenuService: CircularMenuService,
    private notificationsService: NotificationsService,
    private listenForNewMessageGQL: ListenForNewMessageGQL,
    private listenForAmountPushedEventGQL: ListenForAmountPushedEventGQL,
    private listenForUserLoggedInByTargetGQL: ListenForUserLoggedInByTargetGQL,
    private listenForUserLoggedOutByTargetGQL: ListenForUserLoggedOutByTargetGQL,
    private saveCurrentCorporateUserStatusGQL: SaveCurrentCorporateUserStatusGQL,
    private listenForSendThemAndLanguageToWidgetGQL: ListenForSendThemAndLanguageToWidgetGQL,
    private listenForNewAdhocCorporateNotificationGQL: ListenForNewAdhocCorporateNotificationGQL,
    @Inject(DOCUMENT) protected document: Document,
    @Inject(PLATFORM_ID) protected platformId: Object,
  ) {
    const theme = this.appCookieService.get('elvkwdigttheme');
    if (theme === 'dark' || (window as any).widgetInit.theme === 'dark') {
      this.modalService.toggleDarkMode();
    }
    const browserLang = this.appCookieService.get('elvkwdigtlanguage');
    if (browserLang === 'ar-sa' || browserLang === 'ar-tn') {
      this.modalService.rtl$ = true;
    } else {
      this.modalService.rtl$ = false;
    }
    this.playerService.getWidgetVisualsByTargetAndAppPaginated().subscribe();
    this.modalService.activeModal$.subscribe((modal) => {
      this.activeModal = modal;
    });
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
    });
    this.playerService.widgetSettings$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetSettings) => {
      this.loginUrl = widgetSettings?.login?.url;
    });
    this.profileService.currentUser$.pipe(takeUntil(this.unsubscribeAll)).subscribe((currentUser) => {
      this.currentUser = currentUser;
      if (this.currentUser?.id) {
        combineLatest([this.notificationsService.countUnseenCorporateNotificationsForUser(), this.playerService.countUnseenMessages()])
          .pipe(
            rxMap(([unCountNotif, unCountMessages]) => {
              if (unCountMessages > 0) {
                this.circularMenuService.messageNotification$ = true;
              }
              if (unCountNotif > 0) {
                this.notificationsService.unreadNotif$ = true;
              }
            }),
          )
          .subscribe();
        this.listenForNewMessageGQL.subscribe({ userId: this.currentUser.id }).subscribe(({ data }: any) => {
          if (data && this.activeModal !== 'chat') {
            this.circularMenuService.messageNotification$ = true;
          }
          this.playNotification();
        });
        this.listenForNewAdhocCorporateNotificationGQL.subscribe({ userId: this.currentUser.id }).subscribe(({ data }: any) => {
          if (data && this.activeModal !== 'notifications') {
            this.notificationsService.unreadNotif$ = true;
          }
          this.playNotification();
        });
        this.listenForAmountPushedEventGQL.subscribe({ userId: this.currentUser.id }).subscribe(({ data }) => {
          this.playerService.getUserWalletWithReputations().subscribe();
          if (data) {
            this.circularMenuService.walletPushedNotification$ = true;
          }
          this.playNotification();
        });
      }
    });
    this.posId = (window as any).widgetInit.appId;
    this.embed = (window as any).widgetInit.embed;
    this.initializeWidget();
    this.listenForSendThemAndLanguageToWidgetGQL
      .subscribe({
        reference: this.elvkwdigtref,
        target: { pos: this.posId },
      })
      .subscribe(({ data }) => {
        if (data.listenForSendThemAndLanguageToWidget?.theme) {
          this.modalService.toggleDarkMode();
        }
        if (data.listenForSendThemAndLanguageToWidget?.language) {
          const langCode = data.listenForSendThemAndLanguageToWidget?.language;
          this.languageService.setLanguage(langCode);
          if (langCode === 'ar-sa' || langCode === 'ar-tn') {
            this.modalService.rtl$ = true;
          } else {
            this.modalService.rtl$ = false;
          }
        }
      });
  }

  ngOnInit(): void {
    this.playerService.lastWidgetOutbound$.pipe(takeUntil(this.unsubscribeAll)).subscribe((lastWidgetOutbound) => {
      this.modalService.isOnboarded$ = lastWidgetOutbound || this.storageHelper.getData('onboarded') !== 'true' ? false : true;
    });
    combineLatest([this.profileService.currentUser$, this.playerService.widgetSettings$])
      .pipe(
        takeUntil(this.unsubscribeAll),
        rxMap(([currentUser, widgetSettings]: any) => {
          this.widgetSettings = widgetSettings;
          this.position = this.widgetSettings.position?.positioning;
          this.alignment = this.widgetSettings.position?.alignment;
          if (this.alignment === PositionEnum.LEFT) {
            this.direction = 'left';
          }
          this.currentUser = currentUser;
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.playerService.getPublicIp().subscribe((data: any) => {
      this.ipAddress = data.ip;
      this.isIPaddressExist = some(this.widgetSettings?.test?.ips, (ip) => ip === this.ipAddress);
    });
    combineLatest([this.playerService.wallet$, this.playerService.loyaltySettings$, this.playerService.authenticated$])
      .pipe(takeUntil(this.unsubscribeAll))
      .subscribe(([wallet, loyaltySettings, authenticated]) => {
        this.authenticated = authenticated;
        if (authenticated) {
          if (wallet) {
            this.reputationLevels = sortBy(wallet?.reputationLevels, (item) => item.rank);
            forEach(this.reputationLevels, (level, index: number) => {
              const last = index === this.reputationLevels.length - 1;
              if (
                (+wallet?.amount >= +level?.levelInterval?.max && +wallet?.amount < +level?.nextLevelMax && !last) ||
                (+wallet?.amount >= +this.reputationLevels[this.reputationLevels.length - 1]?.levelInterval?.max && last)
              ) {
                this.playerService.currentLevel$ = this.currentLevel = level;
              }
            });
            const index = findIndex(this.reputationLevels, (rep) => rep?.reputationLevel === this.currentLevel?.reputationLevel);
            if (index <= this.reputationLevels?.length - 1 && index > -1) {
              this.playerService.nextLevel$ = this.nextLevel = this.reputationLevels[index + 1];
            } else {
              this.playerService.nextLevel$ = this.nextLevel = this.reputationLevels[0];
            }
            if (index === this.reputationLevels?.length - 1) {
              this.playerService.isFinalLevel$ = this.isFinalLevel = index === this.reputationLevels?.length - 1 ? true : false;
            }
            this.playerService.levelColor$ =
              !this.nextLevel && !this.isFinalLevel
                ? loyaltySettings?.prelevel?.color
                : this.isFinalLevel
                ? this.currentLevel?.color
                : this.nextLevel?.color || '#4F75FF';
            this.playerService.remainingPoints$ = this.nextLevel?.levelInterval?.max - +wallet?.amount;
            this.playerService.currentLevelPercentage$ =
              ((+wallet?.amount - this.nextLevel?.levelInterval?.min) / (this.nextLevel?.levelInterval?.max - this.nextLevel?.levelInterval?.min)) *
              100;
          } else {
            this.playerService.levelColor$ = '#4F75FF';
            this.playerService.currentLevelPercentage$ = 100;
            this.playerService.remainingPoints$ = 3000;
          }
        } else {
          this.appCookieService.set('elvkwdigtauth', 'false');
          this.playerService.currentLevelPercentage$ = null;
          this.nextLevel = this.playerService.nextLevel$ = null;
          this.currentLevel = this.playerService.currentLevel$ = null;
        }
      });
    if (this.authenticated) {
      this.profileService.getProfileCompletnessProgress().subscribe();
    }
    setTimeout(() => {
      this.isLoaded = true;
      this.changeDetectorRef.markForCheck();
    }, 400);
    this.modalService.modalType$.subscribe((modalType) => {
      this.modalType = modalType;
    });
    this.highlightService.vibrating$.subscribe((vibrating) => {
      if (vibrating) {
        this.highlightActivities();
      } else {
        this.unhiglightActivities();
      }
    });

    this.playerService.loginVibrating$.subscribe((vibrating) => {
      if (vibrating) {
        if (this.loginUrl) {
          window.open(this.loginUrl, '_blank');
        } else {
          this.hilightLogin();
        }
      } else {
        this.unhilightLogin();
      }
    });
  }

  positionOnboarding(): void {
    if (this.widget && this.onboarding) {
      const widgetRect = this.widget.nativeElement.getBoundingClientRect();
      this.renderer.setStyle(this.onboarding.nativeElement, 'position', 'fixed');
      this.renderer.setStyle(this.onboarding.nativeElement, 'top', `${widgetRect.bottom + 10}px`); // 10px below the widget
      this.renderer.setStyle(this.onboarding.nativeElement, 'left', `${widgetRect.left}px`);
    }
  }

  // ngAfterViewInit() {
  //   this.positionOnboarding();
  //   window.addEventListener('resize', () => this.positionOnboarding());
  // }

  ngAfterViewInit() {
    // this.positionOnboarding();
    // window.addEventListener('resize', () => this.positionOnboarding());
    this.setTokenCookies();
  }

  getWidgetAnimationClass(): string {
    if (this.isOpen || this.closeButtonVisible) {
      return '';
    }
    if (this.direction === 'right') {
      return this.isMobile ? 'widget-animation-mobile' : 'widget-animation';
    } else {
      return this.isMobile ? 'widget-animation-left-mobile' : 'widget-animation-left';
    }
  }

  generateRandomString(length: number): string {
    const now = new Date();
    const timestamp = now.getTime();
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomCharacters = times(length, () => characters.charAt(random(characters.length - 1)));
    return randomCharacters.join('') + timestamp;
  }

  eventTarget(quest, target) {
    if (
      quest.activityType?.predefined?.action?.code === 'SHARE_LINK_ON_FACEBOOK_FEED' ||
      quest.activityType?.predefined?.action?.code === 'SHARE_LINK_FACEBOOK' ||
      quest.activityType?.predefined?.action?.code === 'SHARE_FACEBOOK_PAGE' ||
      quest.activityType?.predefined?.action?.code === 'SHARE_PRODUCT_FACEBOOK'
    ) {
      (window as any).fbAsyncInit();
      FB.ui(
        {
          display: 'popup',
          method: 'share_open_graph',
          action_type: 'og.likes',
          action_properties: JSON.stringify({
            object: target.getAttribute('data-url'),
          }),
        },
        (response) => {
          if (this.authenticated === true) {
            if (response && !response.error_message) {
              this.performPredefinedActivity(quest.id);
            } else {
              this.translate.get('FB_POST_NOT_SHARED').subscribe((text: string) => {
                Swal.fire({
                  position: 'top-end',
                  icon: 'info',
                  text,
                  showConfirmButton: false,
                  customClass: {
                    container: 'fw-swal-container',
                  },
                  timer: 3000,
                  ...(this.darkMode ? { background: '#1d2333', color: '#fff' } : {}),
                });
              });
            }
          }
        },
      );
    } else if (quest.activityType?.predefined?.action?.code === 'SHARE_LINK_ON_MESSENGER_DIRECT') {
      (window as any).fbAsyncInit();
      FB.ui(
        {
          method: 'send',
          link: target.getAttribute('data-url'),
        },
        (response) => {
          if (this.authenticated === true) {
            if (response && !response.error_message) {
              this.performPredefinedActivity(quest.id);
            } else {
              this.translate.get('MSG_POST_NOT_SHARED').subscribe((text: string) => {
                Swal.fire({
                  position: 'top-end',
                  icon: 'info',
                  text,
                  showConfirmButton: false,
                  customClass: {
                    container: 'fw-swal-container',
                  },
                  timer: 3000,
                  ...(this.darkMode ? { background: '#1d2333', color: '#fff' } : {}),
                });
              });
            }
          }
        },
      );
    } else {
      if (
        this.authenticated === true &&
        (this.getQuestStatus() === CustomQuestStatus.OnceNotDone ||
          this.getQuestStatus() == CustomQuestStatus.Unlimited ||
          this.getQuestStatus() == CustomQuestStatus.RecurrentNotDone ||
          (this.getQuestStatus() == CustomQuestStatus.RecurrentDone && this.getQuestDuration() === 0))
      ) {
        this.performPredefinedActivity(quest.id);
      }
    }
  }

  handleEventListeners() {
    this.activitiesTargets.forEach((target: any): void => {
      const currentClasses = map(Array.from(target.classList), (className) => `.${className}`);
      const activityTypeId = trimStart(intersection(currentClasses, this.activitiesClasses)[0], '._');
      const quest = find(this.quests, (quest) => {
        return quest?.activityType?.id === activityTypeId;
      });
      ['click', 'touchend'].forEach((eventName) => {
        target.removeEventListener(eventName, this.eventTarget.bind(this, quest, target));
        target.addEventListener(eventName, this.eventTarget.bind(this, quest, target));
      });
    });
  }

  initializeWidget(): void {
    this.playerService.findPredefinedQuestsByTargetWithRepeatDate().subscribe((quests) => {
      if (quests?.length) {
        this.quests = quests;
        this.activityTypes = map(this.quests, 'activityType');
        this.activitiesClasses = chain(this.activityTypes)
          .reduce((accumulator: string[], activityType: any) => {
            return [...accumulator, `._${activityType.id}`];
          }, [])
          .value();
        this.activitiesTargets = this.document.querySelectorAll(this.activitiesClasses.join(','));
        this.handleEventListeners();
        this.observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              const newActivitiesTargets = this.document.querySelectorAll(this.activitiesClasses.join(','));
              if (
                (!this.activitiesTargets?.length && newActivitiesTargets?.length) ||
                this.activitiesTargets?.length !== newActivitiesTargets.length
              ) {
                this.activitiesTargets = newActivitiesTargets;
                this.handleEventListeners();
              }
            }
          });
        });
        this.observer.observe(document.body, { childList: true, subtree: true });
      }
    });
    this.elvkwdigtref = this.generateRandomString(8);
    this.storageHelper.setData({ elvkwdigtref: this.elvkwdigtref });
    this.appCookieService.set('elvkwdigtref', this.elvkwdigtref);
    if (this.storageHelper.getData('elvkwdigttoken')) {
      this.storageHelper.setData({ elvkwdigtauth: 'true' });
      this.playerService.authenticated$ = true;
    } else {
      this.storageHelper.setData({ elvkwdigtauth: 'false' });
      this.playerService.authenticated$ = false;
    }
    this.listenForUserLoggedInByTargetGQL
      .subscribe({ reference: this.elvkwdigtref })
      .pipe(
        switchMap(({ data, errors }: any) => {
          if (this.authenticated === true) {
            return throwError(() => new Error('User is already logged in.'));
          }
          if (data) {
            this.modalService.isCompleteProfile$ = true;
            this.playerService.loginVibrating$ = false;
            this.playerService.authenticated$ = true;
            this.storageHelper.setData({ [ACCESS_TOKEN]: data.listenForUserLoggedInByTarget.accessToken });
            this.appCookieService.set(ACCESS_TOKEN, data.listenForUserLoggedInByTarget.accessToken);
            this.storageHelper.setData({ elvkwdigtauth: 'true' });
            return this.playerService.userToken$.pipe(
              take(1),
              switchMap((token) => {
                const requests = [
                  this.profileService.currentUserComplete(),
                  this.playerService.saveCurrentCorporateUserStatus(),
                  this.playerService.findPredefinedQuestsByTargetWithRepeatDate(),
                  this.profileService.getProfileCompletnessProgress(),
                  this.playerService.getUserWalletWithReputations(),
                ];

                if (token) {
                  requests.push(
                    this.profileService.getProfileCompletnessProgress(null, token),
                    this.playerService.getLastReferral(token),
                    this.playerService.getCurrentUserReputationsLossDate(token),
                    this.playerService.getCurrentUserReputationsTurnoverLossDate(token),
                    this.playerService.getUserWalletWithReputations(token),
                    this.playerService.getCurrentUserQuantitativeWallets(token),
                  );
                }
                return combineLatest(requests);
              }),
            );
          }
          if (errors) {
            this.playerService.authenticated$ = false;
            return throwError(() => new Error('Error while logging in.'));
          }
          return of(false);
        }),
        rxMap((response) => {
          const res = response[0];
          this.storageHelper.setData({ elevkusr: res?.id });
          this.appCookieService.set('elevkusr', res?.id);
          return response;
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.listenForUserLoggedOutByTargetGQL
      .subscribe({ reference: this.elvkwdigtref })
      .pipe(
        switchMap(({ data, errors }: any) => {
          if (data) {
            return this.saveCurrentCorporateUserStatusGQL.mutate({ status: UserStatus.OFFLINE, target: { pos: this.posId } });
          }
          if (errors) {
            return throwError(() => new Error('Error while logging out.'));
          }
          return of(false);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.playerService.authenticated$ = false;
          this.playerService.currentLevelPercentage$ = 0;
          this.playerService.remainingPoints$ = 0;
          this.playerService.currentLevel$ = null;
          this.profileService.currentUser$ = null;
          this.playerService.wallet$ = null;
          this.playerService.partnership$ = null;
          this.modalService.modalType$ = 'guest';
          this.appCookieService.set('elvkwdigtauth', 'false');
          this.storageHelper.remove(ACCESS_TOKEN);
          this.appCookieService.remove(ACCESS_TOKEN);
          this.storageHelper.setData({ elvkwdigtauth: 'false' });
          this.storageHelper.setData({ elvkwdigtref: this.elvkwdigtref });
          this.changeDetectorRef.markForCheck();
        }
      });
    this.isMobile = this.deviceInfo.isMobile();
    this.renderer.addClass(this.document.body, 'widget');
  }

  performPredefinedActivity(questId: string) {
    this.circularMenuService
      .performPredefinedQuestByUser(questId)
      .pipe(
        switchMap(() => {
          return this.playerService.findPredefinedQuestsByTargetWithRepeatDate().pipe(
            switchMap(() => {
              return this.playerService.getUserWalletWithReputations();
            }),
          );
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.circularMenuService.walletPushedNotification$ = true;
          this.playNotification();
        }
      });
  }

  hilightLogin() {
    this.translate.get('LOGIN_HIGHLIGHT').subscribe((text: string) => {
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        text,
        showConfirmButton: false,
        customClass: {
          container: 'fw-swal-container',
        },
        timer: 3000,
        ...(this.darkMode ? { background: '#1d2333', color: '#fff' } : {}),
      });
    });
    const highlight: () => void = () => {
      const highlight: () => void = () => {
        this.document.querySelectorAll('._widgetLogin').forEach((element) => {
          element.classList.add('elevok-animate-login');
        });
      };
      highlight();
    };
    highlight();
    this.bodyMutationObserver = new MutationObserver(highlight);
    this.bodyMutationObserver.observe(this.document.getElementsByTagName('body')[0], { subtree: true, childList: true });
  }

  unhilightLogin() {
    this.document.querySelectorAll('._widgetLogin').forEach((element) => {
      element.classList.remove('elevok-animate-login');
    });
    if (this.bodyMutationObserver) {
      this.bodyMutationObserver.disconnect();
    }
  }

  highlightActivities(): void {
    if (this.activityTypes?.length > 0) {
      this.translate.get('GET_REWARDED').subscribe((text: string) => {
        Swal.fire({
          position: 'top-end',
          icon: 'info',
          text,
          showConfirmButton: false,
          customClass: {
            container: 'fw-swal-container',
          },
          timer: 3000,
          ...(this.darkMode ? { background: '#1d2333', color: '#fff' } : {}),
        });
      });
      this.highlighting = true;
      const highlight: () => void = () => {
        forEach(this.document.querySelectorAll(this.activitiesClasses?.join(',')), (target: Element): void => {
          target.classList.add('elevok-animate');
          target.addEventListener('mouseenter', (e) => this.mouseEnterTarget(e as MouseEvent));
          target.addEventListener('mouseleave', (e) => this.mouseLeaveTarget(e as MouseEvent));
        });
      };
      highlight();
      this.bodyMutationObserver = new MutationObserver(highlight);
      this.bodyMutationObserver.observe(this.document.getElementsByTagName('body')[0], { subtree: true, childList: true });
    }
  }

  unhiglightActivities(): void {
    // this.highlighting = false;
    if (this.bodyMutationObserver) {
      this.bodyMutationObserver.disconnect();
    }
    forEach(this.document.querySelectorAll(this.activitiesClasses?.join(',')), (target: Element): void => {
      target.classList.remove('elevok-animate');
      target.removeEventListener('mouseenter', (e) => this.mouseEnterTarget(e as MouseEvent));
      target.removeEventListener('mouseleave', (e) => this.mouseLeaveTarget(e as MouseEvent));
    });
  }

  getQuestDuration(): number {
    const cycle = this.highlightedActivity.recurrence?.cycle ?? 0;
    const enable = this.highlightedActivity.recurrence?.enable ?? false;
    const repeatDate = this.highlightedActivity.repeatDate;
    if (enable && cycle > 0 && repeatDate && isAfter(parseISO(repeatDate), new Date())) {
      const differenceInMillis = differenceInMilliseconds(parseISO(repeatDate), new Date());
      return differenceInMillis;
    } else {
      return 0;
    }
  }

  openguestMode() {
    this.guestModeopen = !this.guestModeopen;
  }

  getQuestStatusText(): string {
    const status = this.getQuestStatus();
    switch (status) {
      case CustomQuestStatus.RecurrentNotDone:
        return 'RecurrentNotDone';
      case CustomQuestStatus.RecurrentDone:
        return 'RecurrentDone';
      case CustomQuestStatus.OnceNotDone:
        return 'OnceNotDone';
      case CustomQuestStatus.Unlimited:
        return 'Unlimited';
      case CustomQuestStatus.OnceDone:
        return 'OnceDone';
      default:
        return 'Unknown';
    }
  }

  getQuestStatus(): CustomQuestStatus {
    const cycle = this.highlightedActivity?.recurrence?.cycle ?? -1;
    const enable = this.highlightedActivity?.recurrence?.enable ?? false;
    const repeatDate = this.highlightedActivity?.repeatDate;
    if (enable && cycle === 0) {
      return CustomQuestStatus.Unlimited;
    }
    if (!enable) {
      return repeatDate === null ? CustomQuestStatus.OnceNotDone : CustomQuestStatus.OnceDone;
    }
    if (enable && cycle > 0) {
      return repeatDate === null
        ? CustomQuestStatus.RecurrentNotDone
        : isAfter(parseISO(repeatDate), new Date())
        ? CustomQuestStatus.RecurrentDone
        : CustomQuestStatus.RecurrentNotDone;
    }
    return CustomQuestStatus.Unknown;
  }

  getQuestColor(): string {
    const status = this.getQuestStatus();
    switch (status) {
      case CustomQuestStatus.OnceDone:
        return 'danger';
      case CustomQuestStatus.OnceNotDone:
        return 'success';
      case CustomQuestStatus.RecurrentDone:
        return 'warning';
      case CustomQuestStatus.RecurrentNotDone:
        return 'success';
      case CustomQuestStatus.Unlimited:
        return 'success';
      default:
        return 'light';
    }
  }

  mouseEnterTarget(event: MouseEvent) {
    if (isPlatformBrowser(this.platformId)) {
      const element: Element = event.target as Element;
      const target = find(this.quests, (quest: QuestWithRepeatDateType) =>
        (event.target as Element).classList.contains(`_${quest?.activityType.id}`),
      );
      this.highlightedActivity = target;
      this.questStatusText = this.getQuestStatusText();
      this.questStatus = this.getQuestStatus();
      this.questColor = this.getQuestColor();
      this.questDuration = this.getQuestDuration();
      const screenYCenter = window.innerHeight / 2;
      const goUp = event.clientY - event.offsetY > screenYCenter;
      this.hightlightCoords = {
        top: goUp ? 'auto' : `${event.clientY - event.offsetY + element.clientHeight + 5}px`,
        bottom: goUp ? `${window.innerHeight - (event.clientY - event.offsetY - 5)}px` : 'auto',
      };
      console.log('🚀 ~ IndexComponent ~ mouseEnterTarget ~ this.hightlightCoords:', this.hightlightCoords);
      this.requestStopHighlighting = false;
    }
  }

  mouseLeaveTarget(event: MouseEvent) {
    this.requestStopHighlighting = true;
    if (this.requestStopHighlighting) {
      setTimeout(() => {
        // delete this.highlightedActivity;
        this.changeDetectorRef.markForCheck();
      }, 300);
    }
  }

  getDirection(event: string) {
    this.direction = event;
    this.alignment = event === 'right' ? PositionEnum.RIGHT : PositionEnum.LEFT;
  }

  handleOpen(event: boolean) {
    this.isOpen = event;
  }

  handleDrag(event) {
    if (!event) {
      if (this.ishoveringArea) {
        this.isHiddenMenu = true;
        this.translate.get(['SEE_YOU_LATER', 'REFRESH_PAGE']).subscribe((translations) => {
          Swal.fire({
            position: 'top-end',
            icon: 'info',
            title: `👋 ${translations.SEE_YOU_LATER}`,
            text: translations.REFRESH_PAGE,
            showConfirmButton: false,
            customClass: {
              container: 'fw-swal-container',
            },
            timer: 3000,
            ...(this.darkMode ? { background: '#1d2333', color: '#fff' } : {}),
          });
        });
      }
      this.closeButtonVisible = false;
      this.ishoveringArea = false;
    } else {
      this.closeButtonVisible = true;
    }
  }

  handleHover(event: boolean) {
    this.ishoveringArea = event;
    this.isHiddenMenu = event;
  }

  playNotification() {
    const sound = new Howl({ src: [`${BASE_URL}/assets/sounds/sound.mp3`] });
    sound.play();
    this.isHiddenMenu = false;
    this.changeDetectorRef.markForCheck();
  }

  setTokenCookies() {
    const cookieToken = this.appCookieService.get(ACCESS_TOKEN);
    const storageToken = this.storageHelper.getData(ACCESS_TOKEN);
    if ((cookieToken && !storageToken) || (storageToken && cookieToken && cookieToken !== storageToken)) {
      this.storageHelper.setData({ [ACCESS_TOKEN]: cookieToken });
      this.storageHelper.setData({ sfcwdigtauth: 'true' });
      this.appCookieService.set('sfcwdigtauth', 'true');
      this.playerService.authenticated$ = true;
      this.saveCurrentCorporateUserStatusGQL.mutate({ status: UserStatus.ONLINE, target: { pos: this.posId } }).pipe(
        rxMap(({ data, errors }: any) => {
          if (data) {
            return data.saveCurrentCorporateUserStatus;
          }
          if (errors) {
            this.playerService.authenticated$ = false;
            return throwError(() => new Error('Error while logging in.'));
          }
        }),
      );
    }
    if (!cookieToken && this.appCookieService.get('sfcwdigtauth') === 'false') {
      this.playerService.authenticated$ = false;
      this.storageHelper.setData({ sfcwdigtauth: 'false' });
      this.saveCurrentCorporateUserStatusGQL
        .mutate({ status: UserStatus.OFFLINE, target: { pos: this.posId } })
        .pipe(
          rxMap(({ data, errors }: any) => {
            if (data) {
              this.storageHelper.remove(ACCESS_TOKEN);
              this.changeDetectorRef.markForCheck();
              return data.saveCurrentCorporateUserStatus;
            }
            if (errors) {
              return throwError(() => new Error('Error while logging out.'));
            }
          }),
        )
        .subscribe();
      this.changeDetectorRef.markForCheck();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
