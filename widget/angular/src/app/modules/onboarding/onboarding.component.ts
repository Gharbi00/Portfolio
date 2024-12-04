import { ChangeDetectorRef, Component, ElementRef, HostBinding, OnInit, ViewEncapsulation } from '@angular/core';

import { BASE_URL } from '../../../environments/environment';
import { ModalService } from '../../shared/services/modal.service';
import { fadeAnimations } from '../../shared/animations/animations';
import { DeviceDetectorService } from 'ngx-device-detector';
import { AppCookieService, StorageHelper } from '@diktup/frontend/helpers';
import { of, Subject, switchMap, take, takeUntil } from 'rxjs';
import { PlayerService } from '../player/player.service';
import {
  LeaderboardCycleEnum,
  OutboundContentWidgetTranslationType,
  OutboundType,
  OutboundWidgetActionsEnum,
} from '@sifca-monorepo/widget-generator';
import { find } from 'lodash';
import { QuestsService } from '../player/components/quests/quests.service';
import { ChallengeService } from '../player/components/challenge/challenge.service';
import { Router } from '@angular/router';
import { LeaderboardService } from '../player/components/leaderboard/leaderboard.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  animations: [fadeAnimations],
  styles: [
    `
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';
      @import '${BASE_URL}/assets/css/owl/owl.carousel.min.css';
      @import '${BASE_URL}/assets/css/owl/owl.theme.default.min.css';

      :root {
        --dynamic-color: #7750f8;
        --dynamic-color2: #615dfa;
        --dynamic-color3: #45437f;
      }

      .mobile-popup-container {
        font-family: Rajdhani, sans-serif !important;
        position: fixed;
        top: 0%;
        left: 0;
        width: 80%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 110000;
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
      }
      .popup-container {
        left: calc(100% - 576px) !important;
        max-width: 528px !important;
        top: 0 !important;
        // top: calc(50% - (100px / 2)) !important;
        font-family: Rajdhani, sans-serif !important;
        position: fixed;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 110000;
        transition: opacity 0.3s ease-in-out, visibility 0.3s ease-in-out;
      }
      @media (600px<width<800px) {
        .popup-container {
          top: 8% !important;
        }
      }

      @media (width<600px) {
        .popup-container {
          top: 7% !important;
        }
      }

      .popup-picture {
        @media (min-width: 1200px) {
          max-height: 100%;
        }

        @media (700px<width<1200px) {
          max-width: 70%;
          max-height: 100%;
        }

        @media (max-width: 700px) {
          width: 100%;
          max-height: 100%;
        }
      }
      .popup-picture::before {
        content: '';
        position: absolute;
        width: 0;
        height: 0;
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        border-left: 10px solid #fff;
        top: 50%;
        right: -10px;
        transform: translateY(-50%);
      }
      .dark-mode {
        .popup-picture::before {
          content: '';
          position: absolute;
          width: 0;
          height: 0;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
          border-left: 10px solid #fff;
          top: 50%;
          right: -10px;
          transform: translateY(-50%);
        }
      }
      width-x {
        @media (max-width: 799px) {
          width: 80%;
        }
      }

      .popup-picture {
        display: grid !important;
        position: relative;
        z-index: 100001;
        opacity: 1;
        visibility: visible;
        margin: auto;
        background-color: #f8f8fb;
        border-radius: 12px;
      }

      .hidden-overflow {
        overflow: hidden auto;
      }
      .dark-mode {
        .popup-color {
          background-color: #161b28 !important;
        }
      }

      .padding-x {
        padding-left: 15px;
        padding-right: 15px;
        padding-top: 15px;
        padding-bottom: 15px;
      }

      .white-text {
        color: white !important;
      }

      .displayed-center {
        display: flex !important;
        justify-content: center !important;
        flex-direction: column !important;
      }

      .color-light {
        color: #5d5858 !important;
      }

      .color-white {
        color: #fff !important;
      }
      .dark-mode a,
      .dark-mode h1,
      .dark-mode h2,
      .dark-mode h3,
      .dark-mode h4,
      .dark-mode h5,
      .dark-mode h6,
      .dark-mode p,
      .dark-mode .quest-item .quest-item-title,
      .dark-mode .quest-item-meta-title {
        color: white;
      }
      .widget-root {
        all: initial !important;
        font-size: 100% !important;
      }
    `,
  ],
})
export class OnboardingComponent implements OnInit {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @HostBinding('style.--dynamic-color') dynamicColor: string = '#ffffff';
  @HostBinding('style.--dynamic-color2') dynamicColor2: string = '#ffffff';
  @HostBinding('style.--dynamic-color3') dynamicColor3: string = '#ffffff';

  rtl: boolean;
  darkMode: boolean;
  isMobile: boolean;
  lastWidgetOutbound: OutboundType;
  outboundTranslation: OutboundContentWidgetTranslationType;

  constructor(
    private router: Router,
    private element: ElementRef,
    private cd: ChangeDetectorRef,
    private modalService: ModalService,
    public storageHelper: StorageHelper,
    private playerService: PlayerService,
    private questsService: QuestsService,
    public appCookieService: AppCookieService,
    private deviceInfo: DeviceDetectorService,
    private challengeService: ChallengeService,
    private leaderboardService: LeaderboardService,
  ) {}

  ngOnInit(): void {
    const defaultLanguage = (window as any).widgetInit.locale;
    this.playerService.lastWidgetOutbound$.pipe(takeUntil(this.unsubscribeAll)).subscribe((lastWidgetOutbound) => {
      if (lastWidgetOutbound) {
        this.lastWidgetOutbound = lastWidgetOutbound;
        this.outboundTranslation = find(
          lastWidgetOutbound?.content?.widget?.translation,
          (trs: OutboundContentWidgetTranslationType) => trs.language?.code === defaultLanguage,
        );
      }
    });
    this.playerService.widgetSettings$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widgetSettings) => {
      this.dynamicColor = widgetSettings?.theme || '#7750f8';
      this.updateColors();
      this.cd.markForCheck();
    });
    this.isMobile = this.deviceInfo.isMobile();
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
    });
    this.modalService.rtl$.subscribe((direction) => {
      this.rtl = direction;
      this.cd.detectChanges();
    });
  }

  handleAction() {
    if (this.lastWidgetOutbound) {
      const widgetAction = this.lastWidgetOutbound?.content?.widget?.callToAction?.action?.widgetAction;
      const paramId = this.lastWidgetOutbound?.content?.widget?.callToAction?.action?.paramId;
      switch (widgetAction) {
        case OutboundWidgetActionsEnum.QUESTS:
          if (paramId) {
            this.toggleModal('questsDetails');
            this.questsService
              .getQuestById(paramId)
              .pipe(
                switchMap((res) => {
                  return this.questsService.getQuestActivitiesByQuest(res?.id);
                }),
                switchMap((res) => {
                  if (res?.[0]?.activity?.action?.definition?.form?.form?.id) {
                    return this.questsService.getQuestionsByForm(res[0]?.activity?.action?.definition?.form?.form?.id);
                  } else return of(null);
                }),
              )
              .subscribe();
          } else {
            this.toggleModal('questsList');
          }
          break;

        case OutboundWidgetActionsEnum.CHALLENGES:
          if (paramId) {
            this.challengeService.getChallengeById(paramId).subscribe((res) => {
              if (!res?.donation) {
                this.toggleModal('challengesDetails');
              } else {
                this.toggleModal('donationDetails');
              }
            });
          } else {
            this.toggleModal('challengeList');
            this.challengeService.getOngoingChallengesByTargetAndUserAudiencePaginated().subscribe();
          }
          break;

        case OutboundWidgetActionsEnum.LEADERBOARD:
          this.leaderboardService.cycle = this.lastWidgetOutbound?.content?.widget?.callToAction?.action.leaderboard || LeaderboardCycleEnum.OVERALL;
          break;

        case OutboundWidgetActionsEnum.URL:
          const isExternalUrl = paramId.startsWith('http://') || paramId.startsWith('https://');

          if (isExternalUrl) {
            window.open(paramId, '_blank');
          } else {
            this.router.navigate([paramId]);
          }
          break;

        case OutboundWidgetActionsEnum.BADGES:
          this.toggleModal('badges');
          break;

        case OutboundWidgetActionsEnum.HOME:
          this.toggleModal('home');
          break;

        case OutboundWidgetActionsEnum.LEVELS:
          this.toggleModal('reputations');
          break;

        case OutboundWidgetActionsEnum.NOTIFICATION:
          this.toggleModal('notifications');
          break;

        case OutboundWidgetActionsEnum.PROFILE:
          this.toggleModal('profile');
          break;

        case OutboundWidgetActionsEnum.REDEEM:
          this.toggleModal('redeem');
          break;

        case OutboundWidgetActionsEnum.WIN:
          this.toggleModal('earn');
          break;

        default:
          break;
      }
    } else {
      this.goToHome();
    }
  }

  toggleModal(modalName: string): void {
    console.log("🚀 ~ OnboardingComponent ~ toggleModal ~ modalName:", modalName)
    this.modalService.isOnboarded$ = true;
    this.modalService.togglePopUp(modalName, this.element);
    this.modalService.modalType$ = 'player';
    this.modalService.isHidden$ = false;
    const input = {
      description: this.lastWidgetOutbound?.content?.widget?.description,
      title: this.lastWidgetOutbound?.content?.widget?.title,
      outbound: this.lastWidgetOutbound?.id,
    };
    console.log('🚀 ~ OnboardingComponent ~ toggleModal ~ input:', input);
    this.playerService.createOutboundCorporateNotification(input).subscribe();
  }

  goToHome() {
    this.closeOnboarding();
    this.playerService.authenticated$.pipe(take(1)).subscribe((authenticated) => {
      this.modalService.modalType$ = authenticated ? 'player' : 'guest';
    });
    this.modalService.isHidden$ = false;
  }

  closeOnboarding() {
    this.modalService.isOnboarded$ = true;
    this.storageHelper.setData({ onboarded: 'true' });
    this.appCookieService.set('onboarded', 'true');
  }

  hexToRgb(hex: string): { r: number; g: number; b: number } {
    let bigint = parseInt(hex.slice(1), 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;
    return { r, g, b };
  }

  rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  generateSynergisticColors(mainColor: string): {
    color2: string;
    color3: string;
  } {
    const { r, g, b } = this.hexToRgb(mainColor);
    const color2 = this.rgbToHex(Math.min(255, r + 28), Math.min(255, g + 30), Math.min(255, b + 7));
    const color3 = this.rgbToHex(Math.max(0, r - 18), Math.max(0, g - 18), Math.max(0, b - 30));
    return { color2, color3 };
  }

  updateColors(): void {
    const colors = this.generateSynergisticColors(this.dynamicColor);
    this.dynamicColor2 = colors.color2;
    this.dynamicColor3 = colors.color3;
  }
}
